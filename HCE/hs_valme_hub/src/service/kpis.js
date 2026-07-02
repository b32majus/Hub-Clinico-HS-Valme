import { parseNumber, normalizeLower, average, uniqueNushas, boolSi } from '../common/utils.js';
import { COMORBIDITY_FIELDS, SURGERY_FIELDS } from '../schema/hs_schema.js';
import { getAllTreatmentEntries, hasAnySurgery } from '../common/therapy.js';

export function computeKpis(rows) {
  const uniquePatients = uniqueNushas(rows).length;
  const primeras = rows.filter(row => normalizeLower(row.tipo_visita) === 'primera').length;
  const seguimientos = rows.filter(row => normalizeLower(row.tipo_visita) === 'seguimiento').length;
  const ihsValues = rows.map(row => parseNumber(row.ihs4_total)).filter(v => v != null);
  const graves = rows.filter(row => normalizeLower(row.ihs4_gravedad) === 'grave').length;
  const conCirugia = rows.filter(row => hasAnySurgery(row)).length;
  const conBiologico = rows.filter(row =>
    getAllTreatmentEntries(row).some(entry => entry.family === 'biologicos')
  ).length;

  return {
    uniquePatients,
    totalVisits: rows.length,
    primeras,
    seguimientos,
    ihs4Mean: ihsValues.length ? average(ihsValues) : 0,
    graves,
    conCirugia,
    conBiologico
  };
}

export function severityCounts(rows) {
  const counts = { Leve: 0, Moderado: 0, Grave: 0 };
  rows.forEach(row => {
    const grade = normalizeLower(row.ihs4_gravedad);
    if (grade === 'leve') counts.Leve += 1;
    else if (grade === 'moderado') counts.Moderado += 1;
    else if (grade === 'grave') counts.Grave += 1;
  });
  return counts;
}

export function visitTypeCounts(rows) {
  return {
    Primera: rows.filter(row => normalizeLower(row.tipo_visita) === 'primera').length,
    Seguimiento: rows.filter(row => normalizeLower(row.tipo_visita) === 'seguimiento').length
  };
}

export function averageEcoIhs4(rows) {
  const values = rows.map(row => parseNumber(row.eco_ihs4)).filter(v => v != null);
  return values.length ? average(values) : 0;
}

export function therapyCounts(rows) {
  const counts = { Topicos: 0, 'Antibioticos orales': 0, Biologicos: 0 };
  rows.forEach(row => {
    const entries = getAllTreatmentEntries(row);
    if (entries.some(e => e.family === 'topicos')) counts.Topicos += 1;
    if (entries.some(e => e.family === 'antibioticos_orales')) counts['Antibioticos orales'] += 1;
    if (entries.some(e => e.family === 'biologicos')) counts.Biologicos += 1;
  });
  return counts;
}

export function surgeryCounts(rows) {
  return SURGERY_FIELDS.map(field => ({
    label: field.label,
    count: rows.filter(row => boolSi(row[field.checkbox])).length
  }));
}

export function topComorbidities(rows, limit = 8) {
  return COMORBIDITY_FIELDS.map(field => ({
    label: field.label,
    count: rows.filter(row => boolSi(row[field.key])).length
  }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}
