import {
  createReservation,
  cancelReservation,
  checkout,
  returnEquipment,
  equipmentStatus,
  overlaps,
} from '../../src/domain/operations.js';

const now = new Date('2026-11-15T08:00:00-06:00');
const input = {
  equipmentId: 'EQ-1',
  person: 'Ana Solís',
  purpose: 'Presentación',
  start: '2026-11-16T09:00:00-06:00',
  end: '2026-11-16T10:00:00-06:00',
};
const fresh = () => ({
  equipment: [{ id: 'EQ-1', condition: 'operational' }],
  reservations: [],
  loans: [],
  activity: [],
});
test('creates reservation and history without mutating input', () => {
  const state = fresh();
  const next = createReservation(state, input, now);
  expect(next.reservations).toHaveLength(1);
  expect(next.activity).toHaveLength(1);
  expect(state.reservations).toHaveLength(0);
});
test('rejects overlapping reservations', () => {
  const state = createReservation(fresh(), input, now);
  expect(() =>
    createReservation(
      state,
      { ...input, start: '2026-11-16T09:30:00-06:00', end: '2026-11-16T10:30:00-06:00' },
      now,
    ),
  ).toThrow('ya tiene una reserva');
});
test('accepts consecutive intervals', () => {
  expect(
    overlaps('2026-11-16T10:00:00-06:00', '2026-11-16T11:00:00-06:00', input.start, input.end),
  ).toBe(false);
  const state = createReservation(fresh(), input, now);
  expect(
    createReservation(state, { ...input, start: input.end, end: '2026-11-16T11:00:00-06:00' }, now)
      .reservations,
  ).toHaveLength(2);
});
test('cancelled reservations release the slot', () => {
  let state = createReservation(fresh(), input, now);
  state = cancelReservation(state, state.reservations[0].id, now);
  expect(createReservation(state, input, now).reservations).toHaveLength(2);
});
test('rejects zero duration', () => {
  expect(() => createReservation(fresh(), { ...input, end: input.start }, now)).toThrow(
    'fin debe ser posterior',
  );
});
test('rejects past start', () => {
  expect(() => createReservation(fresh(), input, new Date('2026-11-17'))).toThrow(
    'inicio debe ser posterior',
  );
});
test('rejects invalid and missing inputs', () => {
  expect(() => createReservation(fresh(), { ...input, equipmentId: '' }, now)).toThrow(
    'equipo válido',
  );
  expect(() => createReservation(fresh(), { ...input, person: '  ' }, now)).toThrow('nombre');
  expect(() => createReservation(fresh(), { ...input, start: 'not a date' }, now)).toThrow(
    'fechas',
  );
});
test('maintenance blocks reservation', () => {
  const state = fresh();
  state.equipment[0].condition = 'maintenance';
  expect(() => createReservation(state, input, now)).toThrow('mantenimiento');
});
function loanState() {
  const state = createReservation(fresh(), input, now);
  return checkout(state, state.reservations[0].id, new Date(input.start));
}
test('checkout before start is rejected', () => {
  const state = createReservation(fresh(), input, now);
  expect(() => checkout(state, state.reservations[0].id, now)).toThrow('al comenzar');
});
test('checkout consumes reservation and prevents a second checkout', () => {
  const state = loanState();
  expect(state.loans).toHaveLength(1);
  expect(state.reservations[0].status).toBe('fulfilled');
  expect(equipmentStatus(state, state.equipment[0])).toBe('loaned');
  expect(() => checkout(state, state.reservations[0].id, new Date(input.start))).toThrow(
    'no está activa',
  );
});
test('return in good condition updates all related records', () => {
  const state = loanState();
  const next = returnEquipment(state, state.loans[0].id, 'good', '', new Date(input.end));
  expect(next.loans[0].status).toBe('returned');
  expect(equipmentStatus(next, next.equipment[0])).toBe('available');
  expect(next.activity[0].action).toBe('Equipo devuelto');
});
test('damaged return requires details and sends equipment to maintenance', () => {
  const state = loanState();
  expect(() =>
    returnEquipment(state, state.loans[0].id, 'damaged', '', new Date(input.end)),
  ).toThrow('Describe');
  const next = returnEquipment(
    state,
    state.loans[0].id,
    'damaged',
    'Pantalla rota',
    new Date(input.end),
  );
  expect(next.equipment[0].condition).toBe('maintenance');
});
test('rejects duplicate and backwards return', () => {
  const state = loanState();
  expect(() => returnEquipment(state, state.loans[0].id, 'good', '', now)).toThrow('anterior');
  const next = returnEquipment(state, state.loans[0].id, 'good', '', new Date(input.end));
  expect(() => returnEquipment(next, next.loans[0].id, 'good', '', new Date(input.end))).toThrow(
    'ya fue devuelto',
  );
});
test('return at the same instant as delivery is allowed', () => {
  const state = loanState();
  expect(
    returnEquipment(state, state.loans[0].id, 'good', '', new Date(input.start)).loans[0].status,
  ).toBe('returned');
});
