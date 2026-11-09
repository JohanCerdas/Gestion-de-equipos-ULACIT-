export class DomainError extends Error {}

export function overlaps(start, end, otherStart, otherEnd) {
  return new Date(start) < new Date(otherEnd) && new Date(end) > new Date(otherStart);
}

/** Validate against the current snapshot. Production must repeat this atomically in PostgreSQL. */
export function validateReservation(state, input, now = new Date()) {
  const equipment = state.equipment.find((item) => item.id === input.equipmentId);
  if (!equipment) throw new DomainError('Selecciona un equipo válido.');
  if (!input.person?.trim()) throw new DomainError('Escribe el nombre de la persona responsable.');
  if (!input.purpose?.trim()) throw new DomainError('Indica el propósito de la reserva.');
  const start = new Date(input.start);
  const end = new Date(input.end);
  if (!Number.isFinite(+start) || !Number.isFinite(+end))
    throw new DomainError('Indica fechas y horas válidas.');
  if (start <= now) throw new DomainError('El inicio debe ser posterior al momento actual.');
  if (end <= start) throw new DomainError('La hora de fin debe ser posterior al inicio.');
  if (equipment.condition === 'maintenance')
    throw new DomainError('Este equipo está en mantenimiento.');
  if (state.loans.some((loan) => loan.equipmentId === equipment.id && loan.status === 'active'))
    throw new DomainError(
      'El equipo tiene un préstamo activo. Registra su devolución antes de reservarlo.',
    );
  if (
    state.reservations.some(
      (r) =>
        r.equipmentId === equipment.id &&
        r.status === 'active' &&
        overlaps(input.start, input.end, r.start, r.end),
    )
  )
    throw new DomainError('El equipo ya tiene una reserva en ese horario.');
  return { ...input, person: input.person.trim(), purpose: input.purpose.trim() };
}

export function createReservation(state, input, now = new Date()) {
  const valid = validateReservation(state, input, now);
  const next = structuredClone(state);
  const reservation = {
    ...valid,
    id: `RES-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
    status: 'active',
  };
  next.reservations.unshift(reservation);
  addEvent(next, 'Reserva creada', reservation.equipmentId, reservation.person, now);
  return next;
}

export function cancelReservation(state, id, now = new Date()) {
  const next = structuredClone(state);
  const reservation = next.reservations.find((item) => item.id === id);
  if (!reservation || reservation.status !== 'active')
    throw new DomainError('Solo puedes cancelar una reserva activa.');
  reservation.status = 'cancelled';
  addEvent(next, 'Reserva cancelada', reservation.equipmentId, reservation.person, now);
  return next;
}

export function checkout(state, id, now = new Date()) {
  const next = structuredClone(state);
  const r = next.reservations.find((item) => item.id === id);
  if (!r || r.status !== 'active') throw new DomainError('La reserva no está activa.');
  const eq = next.equipment.find((item) => item.id === r.equipmentId);
  if (!eq || eq.condition !== 'operational') throw new DomainError('El equipo no está habilitado.');
  if (new Date(r.end) <= now)
    throw new DomainError('La reserva ya terminó. Crea una nueva reserva.');
  if (new Date(r.start) > now)
    throw new DomainError('La entrega se habilita al comenzar la reserva.');
  if (next.loans.some((l) => l.equipmentId === eq.id && l.status === 'active'))
    throw new DomainError('El equipo ya está prestado.');
  r.status = 'fulfilled';
  next.loans.unshift({
    id: `PRE-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
    reservationId: r.id,
    equipmentId: eq.id,
    person: r.person,
    start: now.toISOString(),
    due: r.end,
    status: 'active',
  });
  addEvent(next, 'Equipo entregado', eq.id, r.person, now);
  return next;
}

export function returnEquipment(state, id, condition, notes, now = new Date()) {
  if (!['good', 'damaged'].includes(condition))
    throw new DomainError('Selecciona la condición del equipo.');
  if (condition === 'damaged' && !notes?.trim())
    throw new DomainError('Describe el daño antes de registrar la devolución.');
  const next = structuredClone(state);
  const loan = next.loans.find((item) => item.id === id);
  if (!loan || loan.status !== 'active')
    throw new DomainError('El préstamo ya fue devuelto o no existe.');
  if (new Date(loan.start) > now)
    throw new DomainError('La devolución no puede ser anterior a la entrega.');
  loan.status = 'returned';
  loan.returnedAt = now.toISOString();
  loan.returnCondition = condition;
  loan.notes = notes?.trim() || '';
  next.equipment.find((item) => item.id === loan.equipmentId).condition =
    condition === 'damaged' ? 'maintenance' : 'operational';
  addEvent(
    next,
    condition === 'damaged' ? 'Devuelto con daños' : 'Equipo devuelto',
    loan.equipmentId,
    loan.person,
    now,
  );
  return next;
}

function addEvent(state, action, equipmentId, person, now) {
  state.activity.unshift({
    id: crypto.randomUUID(),
    action,
    equipmentId,
    person,
    date: now.toISOString(),
  });
}

export function equipmentStatus(state, equipment) {
  if (equipment.condition === 'maintenance') return 'maintenance';
  if (state.loans.some((loan) => loan.equipmentId === equipment.id && loan.status === 'active'))
    return 'loaned';
  return 'available';
}
