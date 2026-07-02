import { SHEET_KEYS, REQUIRED } from '../schema/hs_schema.js';

export function validateSheets(workbook) {
  const missing = [];
  for (const key of Object.keys(SHEET_KEYS)) {
    if (!workbook.Sheets[SHEET_KEYS[key]]) {
      missing.push(SHEET_KEYS[key]);
    }
  }
  return missing;
}

export function validateColumns(rows, circuit) {
  if (!Array.isArray(rows) || rows.length === 0) {
    return REQUIRED[circuit] || [];
  }
  const firstRow = rows[0];
  const present = new Set(Object.keys(firstRow));
  const required = REQUIRED[circuit] || [];
  return required.filter(col => !present.has(col));
}

export function getSheetName(circuit) {
  return SHEET_KEYS[circuit] || circuit;
}
