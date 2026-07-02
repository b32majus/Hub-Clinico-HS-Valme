export function normalizeText(value) {
  return String(value == null ? '' : value).trim();
}

export function normalizeLower(value) {
  return normalizeText(value).toLowerCase();
}

export function parseNumber(value) {
  const text = normalizeText(value).replace(',', '.');
  if (!text) return null;
  const parsed = Number(text);
  return Number.isFinite(parsed) ? parsed : null;
}

export function parseDate(value) {
  const text = normalizeText(value);
  if (!text) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) {
    const date = new Date(`${text}T00:00:00`);
    return Number.isNaN(date.getTime()) ? null : date;
  }
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(text)) {
    const [day, month, year] = text.split('/');
    const date = new Date(`${year}-${month}-${day}T00:00:00`);
    return Number.isNaN(date.getTime()) ? null : date;
  }
  const fallback = new Date(text);
  return Number.isNaN(fallback.getTime()) ? null : fallback;
}

export function formatDate(value) {
  const date = value instanceof Date ? value : parseDate(value);
  if (!date) return '';
  return date.toISOString().slice(0, 10);
}

export function dateSortValue(row) {
  const date = parseDate(row?.fecha_visita);
  return date ? date.getTime() : 0;
}

export function boolSi(value) {
  const lower = normalizeLower(value);
  return ['si', 's', 'yes', 'true', '1'].includes(lower);
}

export function escapeHtml(str) {
  return String(str == null ? '' : str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function average(values) {
  if (!values.length) return 0;
  return Number((values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(1));
}

export function uniqueNushas(rows) {
  return [...new Set(rows.map(row => normalizeText(row.nusha)).filter(Boolean))];
}
