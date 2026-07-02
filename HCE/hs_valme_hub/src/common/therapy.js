import { THERAPY_GROUPS, THERAPY_SLOT_LIMIT, SURGERY_FIELDS } from '../schema/hs_schema.js';
import { normalizeText, normalizeLower, boolSi } from './utils.js';

export function getTreatmentEntries(row, prefix) {
  const result = [];
  for (const group of THERAPY_GROUPS) {
    for (let i = 1; i <= THERAPY_SLOT_LIMIT; i += 1) {
      const drug = normalizeText(row[`${prefix}_${group.key}_farmaco_${i}`]);
      const posology = normalizeText(row[`${prefix}_${group.key}_posologia_${i}`]);
      if (drug || posology) {
        result.push({ family: group.key, familyLabel: group.label, drug, posology });
      }
    }
    const otherRaw = normalizeText(row[`${prefix}_${group.key}_otros`]);
    if (otherRaw) {
      otherRaw.split('||').map(item => item.trim()).filter(Boolean).forEach(chunk => {
        const parts = chunk.split('|');
        result.push({
          family: group.key,
          familyLabel: `${group.label} (otros)`,
          drug: normalizeText(parts[0]),
          posology: normalizeText(parts.slice(1).join('|'))
        });
      });
    }
  }
  return result;
}

export function getAllTreatmentEntries(row) {
  return [...getTreatmentEntries(row, 'tx_primera'), ...getTreatmentEntries(row, 'tx_seguimiento')];
}

export function hasTreatment(row, familyKey, exactDrug) {
  const lowerDrug = normalizeLower(exactDrug);
  return getAllTreatmentEntries(row).some(entry =>
    entry.family === familyKey && normalizeLower(entry.drug) === lowerDrug
  );
}

export function listUniqueTreatments(rows, familyKey) {
  const set = new Set();
  rows.forEach(row => {
    getAllTreatmentEntries(row).forEach(entry => {
      if (entry.family === familyKey && entry.drug) set.add(entry.drug);
    });
  });
  return [...set].sort((a, b) => a.localeCompare(b, 'es'));
}

export function hasAnySurgery(row) {
  return SURGERY_FIELDS.some(field => boolSi(row[field.checkbox])) || boolSi(row.cirugia_aplica);
}

export function formatTreatmentSummary(row) {
  const entries = getAllTreatmentEntries(row);
  if (!entries.length) return '';
  return entries.slice(0, 3).map(entry =>
    entry.posology ? `${entry.drug} (${entry.posology})` : entry.drug
  ).join(' | ');
}
