import { SHEET_KEYS, COLUMNS } from '../schema/hs_schema.js';
import { validateSheets, validateColumns } from './validators.js';

function getXLSX() {
  if (typeof window !== 'undefined' && window.XLSX) return window.XLSX;
  throw new Error('SheetJS no esta cargado. Verifica que vendor/xlsx.full.min.js se haya cargado.');
}

function normalizeValue(value) {
  if (value === null || value === undefined) return '';
  if (typeof value === 'number') return value;
  if (value instanceof Date) return value.toISOString().split('T')[0];
  return String(value).trim();
}

function normalizeRow(row) {
  const out = {};
  for (const key of Object.keys(row)) {
    const normalizedKey = String(key).trim().toLowerCase().replace(/\s+/g, '_');
    out[normalizedKey] = normalizeValue(row[key]);
  }
  // Ensure every known schema column exists so downstream modules can read safely.
  for (const sheet of Object.keys(SHEET_KEYS)) {
    for (const col of COLUMNS[sheet]) {
      if (!(col in out)) out[col] = '';
    }
  }
  return out;
}

function readSheet(workbook, sheetName) {
  const XLSX = getXLSX();
  const sheet = workbook.Sheets[sheetName];
  if (!sheet) return [];
  const rawRows = XLSX.utils.sheet_to_json(sheet, { defval: '' });
  return rawRows.map(normalizeRow);
}

export async function loadBase(file) {
  const XLSX = getXLSX();
  const buffer = await file.arrayBuffer();
  let workbook;
  try {
    workbook = XLSX.read(new Uint8Array(buffer), { type: 'array', cellDates: true });
  } catch (err) {
    throw new Error('No se pudo leer el archivo. Asegurate de que sea un Excel o CSV valido.');
  }

  const missingSheets = validateSheets(workbook);
  if (missingSheets.length) {
    throw new Error(`Faltan hojas obligatorias: ${missingSheets.join(', ')}.`);
  }

  const monografica = readSheet(workbook, SHEET_KEYS.monografica);
  const multidisciplinar = readSheet(workbook, SHEET_KEYS.multidisciplinar);

  const warnings = [];
  for (const circuit of Object.keys(SHEET_KEYS)) {
    const rows = circuit === 'monografica' ? monografica : multidisciplinar;
    const missingColumns = validateColumns(rows, circuit);
    if (missingColumns.length) {
      warnings.push(`${SHEET_KEYS[circuit]}: faltan columnes ${missingColumns.join(', ')}`);
    }
  }

  return {
    fileName: file.name,
    monografica,
    multidisciplinar,
    warnings
  };
}

export function createEmptyBase() {
  return {
    fileName: '',
    monografica: [],
    multidisciplinar: [],
    warnings: []
  };
}
