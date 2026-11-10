export const escapeHtml = (value) =>
  String(value ?? '').replace(
    /[&<>"']/g,
    (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char],
  );
export const icon = (name, className = '') =>
  `<i data-lucide="${name}" class="${className}" aria-hidden="true"></i>`;
export const formatDate = (value) =>
  new Intl.DateTimeFormat('es-CR', { day: 'numeric', month: 'short' }).format(new Date(value));
export const formatTime = (value) =>
  new Intl.DateTimeFormat('es-CR', { hour: '2-digit', minute: '2-digit', hour12: false }).format(
    new Date(value),
  );
export const initials = (name) =>
  name
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0])
    .join('');
export function localDateTime(date) {
  const d = new Date(date);
  return new Date(+d - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}
export function emptyState(title, text) {
  return `<div class="empty-state">${icon('search')}<h3>${escapeHtml(title)}</h3><p>${escapeHtml(text)}</p></div>`;
}
