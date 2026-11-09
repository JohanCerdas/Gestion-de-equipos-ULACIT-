import {
  createIcons,
  LayoutDashboard,
  Laptop,
  CalendarDays,
  ArrowLeftRight,
  History,
  Settings,
  ChevronRight,
  ArrowUpRight,
  ArrowRight,
  Plus,
  Search,
  X,
  Menu,
  Check,
  Clock3,
  CircleCheck,
  Wrench,
  Box,
  Projector,
  Camera,
  Tablet,
  Mic,
  SlidersHorizontal,
  RotateCcw,
  Download,
  GraduationCap,
  ChevronDown,
  CalendarCheck,
  ShieldCheck,
  LogOut,
  Monitor,
  CircleHelp,
} from 'lucide';
import { loadState, saveState, resetState } from './services/demo-store.js';
import {
  createReservation,
  cancelReservation,
  checkout,
  returnEquipment,
  equipmentStatus,
} from './domain/operations.js';
import {
  escapeHtml as e,
  icon,
  formatDate,
  formatTime,
  localDateTime,
  emptyState,
} from './shared/ui.js';
import './styles/main.css';

const icons = {
  LayoutDashboard,
  Laptop,
  CalendarDays,
  ArrowLeftRight,
  History,
  Settings,
  ChevronRight,
  ArrowUpRight,
  ArrowRight,
  Plus,
  Search,
  X,
  Menu,
  Check,
  Clock3,
  CircleCheck,
  Wrench,
  Box,
  Projector,
  Camera,
  Tablet,
  Mic,
  SlidersHorizontal,
  RotateCcw,
  Download,
  GraduationCap,
  ChevronDown,
  CalendarCheck,
  ShieldCheck,
  LogOut,
  Monitor,
  CircleHelp,
};
let state = loadState();
let search = '';
let category = 'Todos';
let statusFilter = 'all';
let reservationFilter = 'active';
let loanFilter = 'active';
const routes = {
  dashboard: 'Vista general',
  equipos: 'Equipos',
  reservas: 'Reservas',
  prestamos: 'Préstamos y devoluciones',
  historial: 'Historial',
  configuracion: 'Configuración',
};
const route = () =>
  Object.hasOwn(routes, location.hash.slice(1)) ? location.hash.slice(1) : 'dashboard';
const eqById = (id) => state.equipment.find((item) => item.id === id);
const badges = {
  available: ['Disponible', 'green'],
  loaned: ['Prestado', 'purple'],
  maintenance: ['Mantenimiento', 'amber'],
  active: ['Confirmada', 'green'],
  cancelled: ['Cancelada', 'neutral'],
  fulfilled: ['Entregada', 'purple'],
  returned: ['Devuelto', 'neutral'],
};
function badge(status) {
  const [label, tone] = badges[status] || [status, 'neutral'];
  return `<span class="badge ${tone}"><span></span>${label}</span>`;
}
function drawIcons() {
  createIcons({ icons, attrs: { 'stroke-width': 1.7 } });
}
function notify(message) {
  const el = document.querySelector('#toast');
  el.textContent = message;
  el.classList.add('visible');
  clearTimeout(notify.timer);
  notify.timer = setTimeout(() => el.classList.remove('visible'), 4500);
}
function commit(next, message) {
  saveState(next);
  state = next;
  document.querySelector('#modal').close();
  render();
  notify(message);
}
function navItem(key, label, glyph, count = '') {
  return `<a href="#${key}" class="nav-link ${route() === key ? 'active' : ''}" ${route() === key ? 'aria-current="page"' : ''}>${icon(glyph)}<span>${label}</span>${count ? `<b>${count}</b>` : ''}</a>`;
}

function render() {
  document.title = `${routes[route()]} · ULACIT Equipos`;
  document.querySelector('#app').innerHTML = `
    <aside class="sidebar" aria-label="Navegación principal">
      <a class="brand" href="#dashboard"><span class="brand-mark">U<span>◆</span></span><span>ULACIT<small>GESTIÓN DE EQUIPOS</small></span></a>
      <div class="workspace">${icon('graduation-cap')}<div>Campus universitario<small>Centro de recursos</small></div><span class="online-dot"></span></div>
      <p class="nav-label">ESPACIO DE TRABAJO</p>
      <nav>${navItem('dashboard', 'Vista general', 'layout-dashboard')}${navItem('equipos', 'Equipos', 'laptop', state.equipment.length)}${navItem('reservas', 'Reservas', 'calendar-days')}${navItem('prestamos', 'Préstamos', 'arrow-left-right')}${navItem('historial', 'Historial', 'history')}</nav>
      <div class="sidebar-bottom"><div class="support-card">${icon('shield-check')}<strong>Todo en su lugar.</strong><p>Recursos compartidos,<br/>posibilidades infinitas.</p></div>${navItem('configuracion', 'Configuración', 'settings')}<div class="profile"><span class="avatar">JC</span><div>Johan Cerdas<small>Administrador · Demo</small></div><span class="profile-dot"></span></div></div>
    </aside>
    <div class="sidebar-overlay" data-action="menu"></div>
    <div class="main-shell"><header class="topbar"><div class="breadcrumb"><button class="icon-button mobile-menu" data-action="menu" aria-label="Abrir navegación">${icon('menu')}</button><span>Espacio de trabajo</span>${icon('chevron-right')}<strong>${routes[route()]}</strong></div><div class="topbar-right"><span class="demo-indicator"><span></span>Vista de demostración</span><span class="top-avatar">JC</span></div></header>
    <main id="main-content">${{ dashboard, equipos, reservas, prestamos, historial, configuracion }[route()]()}</main><footer class="app-footer"><span>ULACIT · Centro de recursos</span><span>Proyecto académico · Datos ficticios</span></footer></div>`;
  drawIcons();
}

function heading(eyebrow, title, subtitle, action = '') {
  return `<div class="page-heading"><div><p class="eyebrow">${eyebrow}</p><h1>${title}</h1><p class="subtitle">${subtitle}</p></div>${action}</div>`;
}
const newButton = () =>
  `<button class="button primary" data-action="reserve">${icon('plus')}Nueva reserva</button>`;

function dashboard() {
  const available = state.equipment.filter(
    (item) => equipmentStatus(state, item) === 'available',
  ).length;
  const active = state.reservations
    .filter((r) => r.status === 'active')
    .sort((a, b) => new Date(a.start) - new Date(b.start));
  const loans = state.loans.filter((l) => l.status === 'active');
  const maintenance = state.equipment.filter((item) => item.condition === 'maintenance').length;
  const today = new Intl.DateTimeFormat('es-CR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date());
  return `${heading('TU CAMPUS, CONECTADO', 'Cada recurso, en el lugar correcto.', 'Administra los equipos y acompaña cada etapa de su uso.', `<div class="date-label">${icon('calendar-days')}${today}</div>`)}
    <section class="welcome-card"><div class="welcome-content"><span class="small-label"><span></span>LISTOS PARA TU PRÓXIMA IDEA</span><h2>El equipo que necesitas.<br/>El momento que eliges.</h2><p>Consulta la disponibilidad y organiza tus reservas<br class="desktop-only"/> en un solo espacio.</p><div class="hero-buttons">${newButton()}<a class="text-button" href="#equipos">Explorar equipos ${icon('arrow-up-right')}</a></div></div><div class="hero-art" aria-hidden="true"><div class="orbit orbit-one"></div><div class="orbit orbit-two"></div><div class="floating-tag tag-top">${icon('circle-check')}Recursos disponibles</div><div class="laptop-art"><div class="laptop-screen"><div class="screen-top"><span></span><span></span><span></span></div><div class="screen-content"><div class="screen-emblem">U<span>◆</span></div><div class="screen-lines"><i></i><i></i><i></i></div></div></div><div class="laptop-base"></div></div><div class="floating-tag tag-bottom">${icon('calendar-check')}Todo bajo control</div><div class="art-spark">✦</div></div></section>
    <section class="stats-grid" aria-label="Resumen de recursos">${stat('Equipos disponibles', available, `${state.equipment.length} equipos en el inventario`, 'laptop', 'green')}${stat('Reservas activas', active.length, 'Próximos espacios reservados', 'calendar-days', 'purple')}${stat('Préstamos en curso', loans.length, 'Equipos fuera del centro', 'arrow-left-right', 'blue')}${stat('En mantenimiento', maintenance, 'En revisión técnica', 'wrench', 'amber')}</section>
    <div class="dashboard-columns"><section class="panel reservations-panel"><div class="section-heading"><div><h2>Próximas reservas <span class="count-pill">${active.length}</span></h2><p>Un vistazo a lo que viene.</p></div><a href="#reservas" class="subtle-link">Ver todas ${icon('arrow-right')}</a></div>${reservationTable(active.slice(0, 4), true)}</section><section class="panel activity-panel"><div class="section-heading"><div><h2>Actividad reciente</h2><p>Los últimos movimientos.</p></div><span class="live-dot"></span></div>${activityList(state.activity.slice(0, 3))}<a class="activity-footer" href="#historial">Ver todo el historial ${icon('arrow-right')}</a></section></div>
    <section class="featured-section"><div class="section-heading"><div><h2>Encuentra tu próximo equipo</h2><p>Herramientas para llevar tus ideas más lejos.</p></div><a href="#equipos" class="subtle-link">Ver catálogo ${icon('arrow-right')}</a></div><div class="equipment-grid featured">${state.equipment.slice(0, 4).map(equipmentCard).join('')}</div></section>`;
}
function stat(title, value, caption, glyph, tone) {
  return `<article class="stat-card"><div><p>${title}</p><strong>${String(value).padStart(2, '0')}</strong><small>${caption}</small></div><span class="stat-icon ${tone}">${icon(glyph)}</span></article>`;
}
function equipmentCard(item) {
  const status = equipmentStatus(state, item);
  return `<article class="equipment-card"><button class="equipment-visual ${item.color}" data-action="details" data-id="${item.id}" aria-label="Ver detalles de ${e(item.name)}"><span class="equipment-code">${item.id}</span>${icon(item.icon, 'product-icon')}<span class="view-product">${icon('arrow-up-right')}</span></button><div class="equipment-info"><span class="equipment-category">${e(item.category)}</span><h3><button class="plain-button" data-action="details" data-id="${item.id}">${e(item.name)}</button></h3><div class="equipment-card-bottom">${badge(status)}<button class="round-button" data-action="reserve" data-id="${item.id}" aria-label="Reservar ${e(item.name)}" ${status !== 'available' ? 'disabled' : ''}>${icon('plus')}</button></div></div></article>`;
}
function reservationTable(items, compact = false) {
  if (!items.length)
    return emptyState(
      'Sin reservas por aquí',
      'Crea una reserva para organizar el uso de un equipo.',
    );
  return `<div class="table-scroll"><table><thead><tr><th>Equipo / Responsable</th><th>Fecha y horario</th><th>Estado</th>${compact ? '' : '<th>Acciones</th>'}</tr></thead><tbody>${items
    .map((r) => {
      const eq = eqById(r.equipmentId);
      return `<tr><td><div class="table-resource"><span class="resource-icon ${eq.color}">${icon(eq.icon)}</span><div><strong>${e(eq.name)}</strong><small>${e(r.person)}</small></div></div></td><td><strong class="date-cell">${formatDate(r.start)}${formatDate(r.start) !== formatDate(r.end) ? ` – ${formatDate(r.end)}` : ''}</strong><small>${formatTime(r.start)} – ${formatTime(r.end)}</small></td><td>${badge(r.status)}</td>${compact ? '' : `<td><div class="row-actions">${r.status === 'active' ? `<button class="small-button" data-action="checkout" data-id="${r.id}">Entregar</button><button class="icon-button" data-action="cancel" data-id="${r.id}" aria-label="Cancelar ${r.id}">${icon('x')}</button>` : '<span class="muted">—</span>'}</div></td>`}</tr>`;
    })
    .join('')}</tbody></table></div>`;
}
function activityList(items) {
  return items.length
    ? `<ol class="activity-list">${items.map((event, index) => `<li><span class="activity-symbol ${index ? 'neutral' : 'green'}">${icon(event.action.includes('Reserva') ? 'calendar-days' : 'arrow-left-right')}</span><div><strong>${e(event.action)}</strong><p>${e(eqById(event.equipmentId)?.name || event.equipmentId)}</p><small>${e(event.person)} · ${formatDate(event.date)}, ${formatTime(event.date)}</small></div></li>`).join('')}</ol>`
    : emptyState('Sin movimientos', 'Las operaciones aparecerán aquí.');
}

function equipos() {
  const items = state.equipment.filter(
    (item) =>
      (category === 'Todos' || item.category === category) &&
      (statusFilter === 'all' || equipmentStatus(state, item) === statusFilter) &&
      `${item.name} ${item.id} ${item.category}`.toLowerCase().includes(search.toLowerCase()),
  );
  return `${heading('CENTRO DE RECURSOS', 'Un equipo para cada idea.', 'Explora el catálogo y encuentra lo que necesitas.', newButton())}<section class="catalog-toolbar"><div class="search-field">${icon('search')}<input id="equipment-search" aria-label="Buscar equipos" placeholder="Buscar por nombre, código o categoría…" value="${e(search)}" /></div><label class="select-field">${icon('sliders-horizontal')}<select id="status-filter" aria-label="Filtrar por estado"><option value="all">Todos los estados</option>${[
    ['available', 'Disponibles'],
    ['loaned', 'Prestados'],
    ['maintenance', 'Mantenimiento'],
  ]
    .map(
      ([value, label]) =>
        `<option value="${value}" ${statusFilter === value ? 'selected' : ''}>${label}</option>`,
    )
    .join(
      '',
    )}</select></label></section><div class="tabs category-tabs">${['Todos', 'Computadoras', 'Proyectores', 'Audiovisuales', 'Tabletas'].map((name) => `<button data-action="category" data-value="${name}" class="${category === name ? 'selected' : ''}">${name}</button>`).join('')}<span>${items.length} equipos</span></div>${items.length ? `<div class="equipment-grid">${items.map(equipmentCard).join('')}</div>` : emptyState('No encontramos equipos', 'Prueba con otro nombre o cambia los filtros.')}`;
}
function reservas() {
  const items = state.reservations
    .filter((r) => reservationFilter === 'all' || r.status === reservationFilter)
    .sort((a, b) => new Date(a.start) - new Date(b.start));
  return `${heading('PLANIFICA CON TIEMPO', 'Reservas', 'Organiza horarios, evita conflictos y prepara la próxima entrega.', newButton())}<section class="panel"><div class="tabs panel-tabs">${[
    ['active', 'Activas'],
    ['fulfilled', 'Entregadas'],
    ['cancelled', 'Canceladas'],
    ['all', 'Todas'],
  ]
    .map(
      ([value, label]) =>
        `<button data-action="reservation-filter" data-value="${value}" class="${reservationFilter === value ? 'selected' : ''}">${label}</button>`,
    )
    .join(
      '',
    )}</div>${reservationTable(items)}</section><p class="helper-note">${icon('circle-help')}La entrega se habilita al iniciar el horario reservado. Las reservas consecutivas están permitidas.</p>`;
}
function prestamos() {
  const items = state.loans.filter((l) => l.status === loanFilter);
  return `${heading('CADA ENTREGA CUENTA', 'Préstamos y devoluciones', 'Da seguimiento a los equipos y registra su regreso.', `<a class="button secondary" href="#reservas">${icon('calendar-days')}Ir a reservas</a>`)}<section class="panel"><div class="tabs panel-tabs">${[
    ['active', 'En curso'],
    ['returned', 'Devueltos'],
  ]
    .map(
      ([value, label]) =>
        `<button data-action="loan-filter" data-value="${value}" class="${loanFilter === value ? 'selected' : ''}">${label}</button>`,
    )
    .join('')}</div>${
    items.length
      ? `<div class="table-scroll"><table><thead><tr><th>Equipo / Responsable</th><th>Devolución prevista</th><th>Estado</th><th>Acción</th></tr></thead><tbody>${items
          .map((l) => {
            const eq = eqById(l.equipmentId);
            return `<tr><td><div class="table-resource"><span class="resource-icon ${eq.color}">${icon(eq.icon)}</span><div><strong>${e(eq.name)}</strong><small>${e(l.person)} · ${l.id}</small></div></div></td><td><strong>${formatDate(l.due)}</strong><small>${formatTime(l.due)}</small></td><td>${l.status === 'returned' ? badge('returned') : new Date(l.due) < new Date() ? '<span class="badge amber"><span></span>Por devolver</span>' : badge('loaned')}</td><td>${l.status === 'active' ? `<button class="small-button" data-action="return" data-id="${l.id}">Registrar devolución</button>` : `<span class="muted">${l.returnCondition === 'damaged' ? 'Con daños' : 'Buen estado'}</span>`}</td></tr>`;
          })
          .join('')}</tbody></table></div>`
      : emptyState('Todo al día', 'No hay préstamos en esta sección.')
  }</section>`;
}
function historial() {
  return `${heading('TRAZABILIDAD', 'El recorrido de cada equipo.', 'Consulta las operaciones registradas en esta demostración.', `<button class="button secondary" data-action="export">${icon('download')}Exportar CSV</button>`)}<section class="panel full-history">${activityList(state.activity)}</section>`;
}
function configuracion() {
  return `${heading('TU ESPACIO DE TRABAJO', 'Configuración', 'Información de la versión y datos de demostración.')}<section class="panel settings-panel"><span class="settings-icon">${icon('monitor')}</span><h2>Una base para construir en equipo.</h2><p>Estás utilizando una vista de demostración con datos ficticios que se guardan únicamente en este navegador. Puedes crear reservas, registrar entregas y devoluciones y explorar el catálogo.</p><div class="settings-facts"><div><small>VERSIÓN</small><strong>0.1.0 · Base del proyecto</strong></div><div><small>PERFIL DE DEMOSTRACIÓN</small><strong>Johan Cerdas · Administrador</strong></div><div><small>ALMACENAMIENTO</small><strong>Local a este navegador</strong></div></div><div class="info-note">El inicio de sesión y la conexión a Supabase son parte de la siguiente etapa. Este perfil de demostración no autentica usuarios reales.</div><button class="button secondary" data-action="reset">${icon('rotate-ccw')}Restablecer datos de prueba</button></section>`;
}

function showModal(title, content) {
  const modal = document.querySelector('#modal');
  modal.innerHTML = `<div class="modal-header"><div><p class="eyebrow">CENTRO DE RECURSOS</p><h2 id="modal-title">${title}</h2></div><button class="icon-button" data-action="close" aria-label="Cerrar diálogo">${icon('x')}</button></div>${content}`;
  if (!modal.open) modal.showModal();
  drawIcons();
}
function reserveDialog(equipmentId = '') {
  const start = new Date();
  start.setDate(start.getDate() + 1);
  start.setHours(9, 0, 0, 0);
  const end = new Date(+start + 7200000);
  showModal(
    'Nueva reserva',
    `<p class="modal-description">Aparta un equipo para tu próxima actividad.</p><form id="reserve-form"><label>Equipo<select name="equipmentId" required><option value="">Selecciona un equipo</option>${state.equipment
      .filter((item) => equipmentStatus(state, item) === 'available')
      .map(
        (item) =>
          `<option value="${item.id}" ${item.id === equipmentId ? 'selected' : ''}>${e(item.name)} · ${item.id}</option>`,
      )
      .join(
        '',
      )}</select></label><label>Persona responsable<input name="person" placeholder="Nombre y apellido" required maxlength="100" autocomplete="name" /></label><label>Propósito<input name="purpose" placeholder="Ej. Presentación del proyecto final" required maxlength="200" /></label><div class="form-grid"><label>Inicio<input name="start" type="datetime-local" required value="${localDateTime(start)}" /></label><label>Fin<input name="end" type="datetime-local" required value="${localDateTime(end)}" /></label></div><p class="form-error" role="alert"></p><div class="form-note">${icon('shield-check')}Verificaremos que el horario esté disponible.</div><div class="modal-actions"><button type="button" class="button secondary" data-action="close">Cancelar</button><button type="submit" class="button primary">${icon('check')}Confirmar reserva</button></div></form>`,
  );
}
function returnDialog(id) {
  const loan = state.loans.find((item) => item.id === id);
  showModal(
    'Registrar devolución',
    `<p class="modal-description">${e(eqById(loan.equipmentId).name)} · ${e(loan.person)}</p><form id="return-form" data-id="${id}"><label>Condición del equipo<select name="condition"><option value="good">Buen estado</option><option value="damaged">Con daños</option></select></label><label>Observaciones<textarea name="notes" rows="3" maxlength="500" placeholder="Describe el daño si corresponde"></textarea></label><p class="form-error" role="alert"></p><div class="form-note">${icon('circle-help')}Los equipos con daños se envían a mantenimiento.</div><div class="modal-actions"><button type="button" class="button secondary" data-action="close">Cancelar</button><button class="button primary" type="submit">Registrar devolución</button></div></form>`,
  );
}
function confirmDialog(title, description, action, id = '') {
  showModal(
    title,
    `<p class="modal-description">${e(description)}</p><div class="modal-actions"><button class="button secondary" data-action="close">Volver</button><button class="button primary" data-action="${action}" data-id="${id}">Confirmar</button></div>`,
  );
}

document.addEventListener('click', (event) => {
  const button = event.target.closest('[data-action]');
  if (!button) return;
  const { action, id, value } = button.dataset;
  try {
    if (action === 'menu') document.body.classList.toggle('menu-open');
    if (action === 'close') document.querySelector('#modal').close();
    if (action === 'reserve') reserveDialog(id);
    if (action === 'category') {
      category = value;
      render();
    }
    if (action === 'reservation-filter') {
      reservationFilter = value;
      render();
    }
    if (action === 'loan-filter') {
      loanFilter = value;
      render();
    }
    if (action === 'cancel')
      confirmDialog(
        'Cancelar reserva',
        'Se liberará el horario del equipo. Esta operación quedará en el historial.',
        'confirm-cancel',
        id,
      );
    if (action === 'confirm-cancel')
      commit(cancelReservation(state, id), 'Reserva cancelada. El horario quedó disponible.');
    if (action === 'checkout')
      confirmDialog(
        'Registrar entrega',
        'Confirma que el equipo fue entregado a la persona responsable. La reserva debe estar en su horario de uso.',
        'confirm-checkout',
        id,
      );
    if (action === 'confirm-checkout')
      commit(checkout(state, id), 'Préstamo registrado correctamente.');
    if (action === 'return') returnDialog(id);
    if (action === 'reset')
      confirmDialog(
        'Restablecer demostración',
        'Se eliminarán los cambios de esta demostración en tu navegador y se cargarán los datos iniciales.',
        'confirm-reset',
      );
    if (action === 'confirm-reset') {
      state = resetState();
      document.querySelector('#modal').close();
      render();
      notify('Datos de demostración restablecidos.');
    }
    if (action === 'details') {
      const item = eqById(id);
      showModal(
        e(item.name),
        `<div class="detail-art ${item.color}">${icon(item.icon)}</div><div class="detail-meta">${badge(equipmentStatus(state, item))}<span>${item.id}</span></div><p>${e(item.description)}</p><p class="muted">${e(item.location)} · ${e(item.category)}</p><div class="modal-actions"><button class="button secondary" data-action="close">Cerrar</button><button class="button primary" data-action="reserve" data-id="${id}" ${equipmentStatus(state, item) !== 'available' ? 'disabled' : ''}>Reservar equipo</button></div>`,
      );
    }
    if (action === 'export') {
      const cell = (value) =>
        '"' +
        String(value)
          .replace(/^[=+@-]/, "'$&")
          .replaceAll('"', '""') +
        '"';
      const csv = [
        ['Fecha', 'Acción', 'Equipo', 'Responsable'],
        ...state.activity.map((item) => [
          item.date,
          item.action,
          eqById(item.equipmentId)?.name,
          item.person,
        ]),
      ]
        .map((row) => row.map(cell).join(','))
        .join('\r\n');
      const url = URL.createObjectURL(
        new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' }),
      );
      const a = document.createElement('a');
      a.href = url;
      a.download = 'historial-equipos.csv';
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      notify('Historial exportado.');
    }
  } catch (error) {
    notify(error.message);
  }
});
document.addEventListener('submit', (event) => {
  if (!['reserve-form', 'return-form'].includes(event.target.id)) return;
  event.preventDefault();
  const form = event.target;
  const data = Object.fromEntries(new FormData(form));
  try {
    if (form.id === 'reserve-form')
      commit(
        createReservation(state, {
          ...data,
          start: new Date(data.start).toISOString(),
          end: new Date(data.end).toISOString(),
        }),
        'Reserva registrada correctamente.',
      );
    else
      commit(
        returnEquipment(state, form.dataset.id, data.condition, data.notes),
        'Devolución registrada correctamente.',
      );
  } catch (error) {
    form.querySelector('.form-error').textContent = error.message;
  }
});
document.addEventListener('input', (event) => {
  if (event.target.id === 'equipment-search') {
    search = event.target.value;
    const position = event.target.selectionStart;
    render();
    const field = document.querySelector('#equipment-search');
    field.focus();
    field.setSelectionRange(position, position);
  }
});
document.addEventListener('change', (event) => {
  if (event.target.id === 'status-filter') {
    statusFilter = event.target.value;
    render();
  }
});
window.addEventListener('hashchange', () => {
  document.body.classList.remove('menu-open');
  render();
  window.scrollTo(0, 0);
});
render();
