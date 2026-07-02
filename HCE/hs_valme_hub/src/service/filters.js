import { normalizeLower, boolSi, parseDate } from '../common/utils.js';
import { SURGERY_FIELDS } from '../schema/hs_schema.js';
import { hasTreatment, listUniqueTreatments, hasAnySurgery } from '../common/therapy.js';

const SURGERY_FILTER_MAP = {
  dermatologia: 'cirugia_dermatologia',
  general: 'cirugia_general',
  plastica: 'cirugia_plastica',
  ginecologia: 'cirugia_ginecologia',
  urologia: 'cirugia_urologia'
};

export function buildFilterOptions(rows) {
  return {
    biologicos: listUniqueTreatments(rows, 'biologicos'),
    antibioticos: listUniqueTreatments(rows, 'antibioticos_orales')
  };
}

export function matchesCirugia(row, filterValue) {
  if (!filterValue) return true;
  if (filterValue === 'si') return hasAnySurgery(row);
  if (filterValue === 'no') return !hasAnySurgery(row);
  return boolSi(row[SURGERY_FILTER_MAP[filterValue]]);
}

export function matchesGestionFilters(row, filters) {
  if (filters.tipoVisita && normalizeLower(row.tipo_visita) !== filters.tipoVisita) return false;
  if (filters.gravedad && normalizeLower(row.ihs4_gravedad) !== normalizeLower(filters.gravedad)) return false;
  if (filters.biologico && !hasTreatment(row, 'biologicos', filters.biologico)) return false;
  if (filters.antibiotico && !hasTreatment(row, 'antibioticos_orales', filters.antibiotico)) return false;
  if (filters.cirugia && !matchesCirugia(row, filters.cirugia)) return false;
  if (filters.comorb && !boolSi(row[filters.comorb])) return false;
  if (filters.morisky && normalizeLower(row.seguimiento_morisky_resultado) !== filters.morisky) return false;

  const rowDate = parseDate(row.fecha_visita);
  if (filters.dateFrom) {
    const from = parseDate(filters.dateFrom);
    if (from && (!rowDate || rowDate < from)) return false;
  }
  if (filters.dateTo) {
    const to = parseDate(filters.dateTo);
    if (to) {
      to.setHours(23, 59, 59, 999);
      if (!rowDate || rowDate > to) return false;
    }
  }
  return true;
}

export function applyFilters(rows, filters) {
  return rows.filter(row => matchesGestionFilters(row, filters));
}
