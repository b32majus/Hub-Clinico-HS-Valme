import { formatDate, dateSortValue } from '../common/utils.js';
import { formatTreatmentSummary } from '../common/therapy.js';

const SUMMARY_COLUMNS = [
  { key: 'nusha', label: 'NUSHA' },
  { key: 'fecha_visita', label: 'Fecha', format: formatDate },
  { key: 'tipo_visita', label: 'Tipo visita' },
  { key: 'ihs4_total', label: 'IHS4' },
  { key: 'ihs4_gravedad', label: 'Gravedad' },
  { key: 'eco_ihs4', label: 'Eco IHS4' },
  { key: 'dlqi_total', label: 'DLQI' },
  { key: 'hsqol_total', label: 'HSQoL' },
  { key: 'eva_dolor', label: 'EVA' },
  { key: 'tratamiento', label: 'Tratamiento', compute: formatTreatmentSummary }
];

export function buildSummaryRows(rows, { limit = 80 } = {}) {
  const sorted = [...rows].sort((a, b) => dateSortValue(b) - dateSortValue(a));
  return sorted.slice(0, limit).map(row => {
    const out = {};
    for (const col of SUMMARY_COLUMNS) {
      if (col.compute) out[col.key] = col.compute(row);
      else out[col.key] = col.format ? col.format(row[col.key]) : (row[col.key] ?? '');
    }
    return out;
  });
}

export function getSummaryColumns() {
  return SUMMARY_COLUMNS;
}

function csvEscape(value) {
  const text = String(value == null ? '' : value);
  if (text.includes('"') || text.includes(',') || text.includes('\n')) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

export function toCsv(rows) {
  if (!rows.length) return '';
  const headers = SUMMARY_COLUMNS.map(c => c.label);
  const lines = [headers.join(',')];
  for (const row of rows) {
    lines.push(SUMMARY_COLUMNS.map(c => csvEscape(row[c.key])).join(','));
  }
  return lines.join('\n');
}

export function toTsvSummary(rows) {
  if (!rows.length) return '';
  const headers = SUMMARY_COLUMNS.map(c => c.label);
  const lines = [headers.join('\t')];
  for (const row of rows) {
    lines.push(SUMMARY_COLUMNS.map(c => String(row[c.key] ?? '').replace(/\t/g, ' ')).join('\t'));
  }
  return lines.join('\n');
}
