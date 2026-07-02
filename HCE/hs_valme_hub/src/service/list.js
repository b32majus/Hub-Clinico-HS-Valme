import { formatDate, dateSortValue } from '../common/utils.js';
import { formatTreatmentSummary } from '../common/therapy.js';

const BASE_SUMMARY_COLUMNS = [
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

const V2_SUMMARY_COLUMNS = [
  { key: 'flares_total_ultimo_anio', label: 'Brotes ultimo año' },
  { key: 'flares_desde_ultima_visita', label: 'Brotes desde ultima' },
  { key: 'eva_prurito', label: 'EVA prurito' },
  { key: 'eva_olor', label: 'EVA olor' },
  { key: 'eva_supuracion', label: 'EVA supuracion' }
];

export function getSummaryColumns({ includeV2Columns = false } = {}) {
  return includeV2Columns ? [...BASE_SUMMARY_COLUMNS, ...V2_SUMMARY_COLUMNS] : BASE_SUMMARY_COLUMNS;
}

export function buildSummaryRows(rows, { limit = 80, includeV2Columns = false } = {}) {
  const columns = getSummaryColumns({ includeV2Columns });
  const sorted = [...rows].sort((a, b) => dateSortValue(b) - dateSortValue(a));
  return sorted.slice(0, limit).map(row => {
    const out = {};
    for (const col of columns) {
      if (col.compute) out[col.key] = col.compute(row);
      else out[col.key] = col.format ? col.format(row[col.key]) : (row[col.key] ?? '');
    }
    return out;
  });
}

function csvEscape(value) {
  const text = String(value == null ? '' : value);
  if (text.includes('"') || text.includes(',') || text.includes('\n')) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

export function toCsv(rows, { includeV2Columns = false } = {}) {
  if (!rows.length) return '';
  const columns = getSummaryColumns({ includeV2Columns });
  const headers = columns.map(c => c.label);
  const lines = [headers.join(',')];
  for (const row of rows) {
    lines.push(columns.map(c => csvEscape(row[c.key])).join(','));
  }
  return lines.join('\n');
}

export function toTsvSummary(rows, { includeV2Columns = false } = {}) {
  if (!rows.length) return '';
  const columns = getSummaryColumns({ includeV2Columns });
  const headers = columns.map(c => c.label);
  const lines = [headers.join('\t')];
  for (const row of rows) {
    lines.push(columns.map(c => String(row[c.key] ?? '').replace(/\t/g, ' ')).join('\t'));
  }
  return lines.join('\n');
}
