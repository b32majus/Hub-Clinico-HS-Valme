import { COLUMNS, REQUIRED, VALIDATORS, SHEET_KEYS } from '../schema/hs_schema.js';

const RANGE_VALIDATORS = {
  eva_prurito: { min: 0, max: 10, integer: true, message: 'EVA prurito debe ser un entero entre 0 y 10.' },
  eva_olor: { min: 0, max: 10, integer: true, message: 'EVA olor debe ser un entero entre 0 y 10.' },
  eva_supuracion: { min: 0, max: 10, integer: true, message: 'EVA supuracion debe ser un entero entre 0 y 10.' },
  flares_total_ultimo_anio: { min: 0, integer: true, message: 'Brotes en el ultimo año debe ser un entero mayor o igual a 0.' },
  flares_desde_ultima_visita: { min: 0, integer: true, message: 'Brotes desde la ultima visita debe ser un entero mayor o igual a 0.' },
  alcohol_cervezas_vino_semana: { min: 0, message: 'Cervezas/vino por semana debe ser mayor o igual a 0.' },
  alcohol_copas_destilados_semana: { min: 0, message: 'Copas de destilados por semana debe ser mayor o igual a 0.' },
  alcohol_ube_semana: { min: 0, message: 'UBE semana debe ser mayor o igual a 0.' }
};

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

  for (const field of Object.keys(RANGE_VALIDATORS)) {
    const value = payload[field];
    if (value === '' || value === null || value === undefined) continue;
    const rule = RANGE_VALIDATORS[field];
    const num = Number(value);
    if (Number.isNaN(num)) {
      errors.push(rule.message);
      continue;
    }
    if (rule.integer && !Number.isInteger(num)) {
      errors.push(rule.message);
      continue;
    }
    if (rule.min !== undefined && num < rule.min) errors.push(rule.message);
    if (rule.max !== undefined && num > rule.max) errors.push(rule.message);
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
