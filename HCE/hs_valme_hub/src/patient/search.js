import { normalizeText, normalizeLower } from '../common/utils.js';
import { CANONICAL_PATIENT_KEY } from '../schema/hs_schema.js';

export function getAllRows(base) {
  if (!base) return [];
  return [...(base.monografica || []), ...(base.multidisciplinar || [])];
}

export function getUniquePatients(base) {
  const rows = getAllRows(base);
  const map = new Map();
  rows.forEach(row => {
    const id = normalizeText(row[CANONICAL_PATIENT_KEY]).toUpperCase();
    if (!id) return;
    if (!map.has(id)) {
      map.set(id, { nusha: id, name: guessPatientName(row), rowCount: 0 });
    }
    map.get(id).rowCount += 1;
  });
  return Array.from(map.values()).sort((a, b) => a.nusha.localeCompare(b.nusha, 'es'));
}

export function getPatientRows(base, nusha) {
  if (!base || !nusha) return [];
  const id = normalizeText(nusha).toUpperCase();
  return getAllRows(base)
    .filter(row => normalizeText(row[CANONICAL_PATIENT_KEY]).toUpperCase() === id)
    .sort((a, b) => {
      const da = new Date(a.fecha_visita || 0).getTime();
      const db = new Date(b.fecha_visita || 0).getTime();
      if (Number.isNaN(da) && Number.isNaN(db)) return 0;
      if (Number.isNaN(da)) return 1;
      if (Number.isNaN(db)) return -1;
      return da - db;
    });
}

export function searchPatients(base, term) {
  const raw = normalizeText(term);
  if (!raw) return getUniquePatients(base);
  const needle = normalizeLower(raw);
  return getUniquePatients(base).filter(p =>
    normalizeLower(p.nusha).includes(needle) ||
    normalizeLower(p.name).includes(needle)
  );
}

function guessPatientName(row) {
  const first = normalizeText(row.nombre || row.nombre_paciente);
  const last = normalizeText(row.apellidos || row.apellido);
  if (first && last) return `${first} ${last}`;
  return first || last || '';
}
