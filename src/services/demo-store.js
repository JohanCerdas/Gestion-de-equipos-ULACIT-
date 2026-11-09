const KEY = 'ulacit-equipment-demo-v1';

export function seed(now = new Date()) {
  const date = (days, hour) => {
    const d = new Date(now);
    d.setDate(d.getDate() + days);
    d.setHours(hour, 0, 0, 0);
    return d.toISOString();
  };
  return {
    version: 1,
    equipment: [
      {
        id: 'EQ-001',
        name: 'MacBook Air M2',
        brand: 'Apple',
        category: 'Computadoras',
        icon: 'laptop',
        color: 'lilac',
        location: 'Laboratorio de innovación',
        condition: 'operational',
        description: '13 pulgadas · 16 GB RAM · 256 GB SSD',
      },
      {
        id: 'EQ-002',
        name: 'Proyector PowerLite',
        brand: 'Epson',
        category: 'Proyectores',
        icon: 'projector',
        color: 'peach',
        location: 'Centro de recursos',
        condition: 'operational',
        description: '3.600 lúmenes · HDMI · Full HD',
      },
      {
        id: 'EQ-003',
        name: 'Cámara EOS R50',
        brand: 'Canon',
        category: 'Audiovisuales',
        icon: 'camera',
        color: 'mint',
        location: 'Estudio audiovisual',
        condition: 'operational',
        description: '24,2 MP · Video 4K · Lente 18–45 mm',
      },
      {
        id: 'EQ-004',
        name: 'iPad Air',
        brand: 'Apple',
        category: 'Tabletas',
        icon: 'tablet',
        color: 'blue',
        location: 'Laboratorio de innovación',
        condition: 'operational',
        description: '10,9 pulgadas · 64 GB · Apple Pencil',
      },
      {
        id: 'EQ-005',
        name: 'ThinkPad E14',
        brand: 'Lenovo',
        category: 'Computadoras',
        icon: 'laptop',
        color: 'lilac',
        location: 'Centro de recursos',
        condition: 'operational',
        description: '14 pulgadas · 16 GB RAM · 512 GB SSD',
      },
      {
        id: 'EQ-006',
        name: 'Micrófono NT-USB',
        brand: 'RØDE',
        category: 'Audiovisuales',
        icon: 'mic',
        color: 'peach',
        location: 'Estudio audiovisual',
        condition: 'maintenance',
        description: 'Condensador · USB · Soporte de escritorio',
      },
      {
        id: 'EQ-007',
        name: 'Proyector BenQ MH560',
        brand: 'BenQ',
        category: 'Proyectores',
        icon: 'projector',
        color: 'mint',
        location: 'Centro de recursos',
        condition: 'operational',
        description: '3.800 lúmenes · Full HD · HDMI',
      },
      {
        id: 'EQ-008',
        name: 'Galaxy Tab S9',
        brand: 'Samsung',
        category: 'Tabletas',
        icon: 'tablet',
        color: 'blue',
        location: 'Laboratorio de innovación',
        condition: 'operational',
        description: '11 pulgadas · 128 GB · S Pen',
      },
    ],
    reservations: [
      {
        id: 'RES-001',
        equipmentId: 'EQ-001',
        person: 'Sofía Vargas',
        purpose: 'Proyecto de diseño',
        start: date(1, 9),
        end: date(1, 11),
        status: 'active',
      },
      {
        id: 'RES-002',
        equipmentId: 'EQ-002',
        person: 'Daniel Mora',
        purpose: 'Presentación de investigación',
        start: date(1, 10),
        end: date(1, 12),
        status: 'active',
      },
      {
        id: 'RES-003',
        equipmentId: 'EQ-003',
        person: 'Valeria Solís',
        purpose: 'Producción audiovisual',
        start: date(2, 8),
        end: date(2, 12),
        status: 'active',
      },
      {
        id: 'RES-004',
        equipmentId: 'EQ-004',
        person: 'Andrés Rojas',
        purpose: 'Taller de ilustración',
        start: date(2, 13),
        end: date(2, 15),
        status: 'active',
      },
      {
        id: 'RES-005',
        equipmentId: 'EQ-005',
        person: 'Mariana Castro',
        purpose: 'Trabajo de laboratorio',
        start: date(0, 7),
        end: date(1, 17),
        status: 'fulfilled',
      },
      {
        id: 'RES-006',
        equipmentId: 'EQ-008',
        person: 'Diego Jiménez',
        purpose: 'Prototipo de aplicación',
        start: date(-1, 8),
        end: date(0, 10),
        status: 'fulfilled',
      },
    ],
    loans: [
      {
        id: 'PRE-001',
        reservationId: 'RES-005',
        equipmentId: 'EQ-005',
        person: 'Mariana Castro',
        start: date(-1, 7),
        due: date(1, 17),
        status: 'active',
      },
      {
        id: 'PRE-002',
        reservationId: 'RES-006',
        equipmentId: 'EQ-008',
        person: 'Diego Jiménez',
        start: date(-1, 8),
        due: date(0, 10),
        status: 'active',
      },
    ],
    activity: [
      {
        id: 'EV-1',
        action: 'Reserva creada',
        equipmentId: 'EQ-001',
        person: 'Sofía Vargas',
        date: new Date(+now - 900000).toISOString(),
      },
      {
        id: 'EV-2',
        action: 'Equipo entregado',
        equipmentId: 'EQ-005',
        person: 'Mariana Castro',
        date: new Date(+now - 3600000).toISOString(),
      },
      {
        id: 'EV-3',
        action: 'Reserva creada',
        equipmentId: 'EQ-003',
        person: 'Valeria Solís',
        date: new Date(+now - 7200000).toISOString(),
      },
    ],
  };
}

export function loadState() {
  try {
    const state = JSON.parse(localStorage.getItem(KEY));
    if (
      state?.version === 1 &&
      ['equipment', 'reservations', 'loans', 'activity'].every((key) => Array.isArray(state[key]))
    )
      return state;
  } catch {
    /* Recover corrupted demo data. */
  }
  return seed();
}

export function saveState(state) {
  localStorage.setItem(KEY, JSON.stringify(state));
}
export function resetState() {
  const state = seed();
  saveState(state);
  return state;
}
