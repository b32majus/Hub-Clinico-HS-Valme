import { COLUMNS, REQUIRED, VALIDATORS, SHEET_KEYS } from '../schema/hs_schema.js';

function escapeCell(value) {
  if (value === null || value === undefined) return '';
  return String(value).replace(/\t/g, ' ').replace(/\r?\n/g, ' ').trim();
}

export function buildTSV(circuit, payload) {
  const columns = COLUMNS[circuit];
  if (!columns) {
    throw new Error(`Circuito desconocido: ${circuit}`);
  }
  const values = columns.map(col => escapeCell(payload[col]));
  return values.join('\t');
}

export function getDestinationSheet(circuit) {
  return SHEET_KEYS[circuit] || circuit;
}

export function validatePayload(payload, circuit) {
  const errors = [];
  const required = REQUIRED[circuit] || [];

  for (const field of required) {
    const value = payload[field];
    if (value === '' || value === null || value === undefined) {
      errors.push(`El campo obligatorio "${field}" esta vacio.`);
    }
  }

  for (const field of Object.keys(VALIDATORS)) {
    const value = payload[field];
    if (value === '' || value === null || value === undefined) continue;
    const rule = VALIDATORS[field];

    if (rule.pattern && !rule.pattern.test(String(value))) {
      errors.push(rule.message || `${field} no tiene un formato valido.`);
    }
    if (rule.min !== undefined || rule.max !== undefined) {
      const num = Number(value);
      if (Number.isNaN(num)) {
        errors.push(rule.message || `${field} debe ser un numero.`);
      } else {
        if (rule.min !== undefined && num < rule.min) errors.push(rule.message || `${field} por debajo del minimo.`);
        if (rule.max !== undefined && num > rule.max) errors.push(rule.message || `${field} por encima del maximo.`);
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
