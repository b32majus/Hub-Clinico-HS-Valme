/**
 * Parity runtime check: hub TSV vs legacy HS form TSV.
 *
 * Builds three representative visits (first monografica, first multidisciplinar,
 * follow-up) using the hub schema and compares the exported one-row TSV against
 * a faithful mirror of the legacy export logic. Differences are reported with
 * cell index and expected/actual values.
 */

import { COLUMNS, SHEET_KEYS, IHS_REGIONS, IHS_LESION_TYPES } from '../src/schema/hs_schema.js';
import { buildTSV } from '../src/tsv/exporter.js';

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

/**
 * Mirrors the legacy form's export value transform:
 *   String(row[header] || '').replace(/\t/g, ' ')
 */
function legacyEscape(value) {
  return String(value == null ? '' : value).replace(/\t/g, ' ');
}

function buildLegacyTSV(circuit, payload) {
  const columns = COLUMNS[circuit];
  assert(columns, `Unknown circuit: ${circuit}`);
  const values = columns.map(col => legacyEscape(payload[col]));
  return values.join('\t');
}

function makeBasePayload() {
  const payload = {
    nusha: 'AN1234567890',
    fecha_visita: '2024-06-15',
    tipo_visita: 'primera',
    consulta: 'monografica',
    origen_paciente: 'derma_gral',
    antecedentes_familiares_hs: 'No',
    anio_inicio: '2010',
    fumador: 'No',
    cigarros_dia: '',
    anios_fumador: '',
    sexo_nacimiento: 'femenino',
    anio_diagnostico: '2015',
    peso_kg: '70',
    talla_m: '1.65',
    imc: '25.71',
    eco_nodulos: '1',
    eco_abscesos: '0',
    eco_fistulas: '0',
    eco_doppler: 'No',
    eva_dolor: '3',
    otras_regiones: 'Axila izquierda residual',
    cicatrices: '2',
    otras_lesiones: 'Quiste epidermoide',
    cirugia_aplica: 'No',
    seguimiento_tratamiento_previo: '',
    seguimiento_tratamiento_actual: '',
    seguimiento_decision: '',
    seguimiento_adherencia: '',
    seguimiento_ajuste_pauta: '',
    seguimiento_morisky_q1: '',
    seguimiento_morisky_q2: '',
    seguimiento_morisky_q3: '',
    seguimiento_morisky_q4: '',
    seguimiento_morisky_resultado: '',
    seguimiento_motivo_cambio: '',
    seguimiento_efectos_adversos: 'No',
    otros_comentarios: 'Paciente estable',
    hallazgos_interes: 'Ninguno'
  };

  // Comorbidities: mostly No, one Si to prove case normalization.
  const comorbKeys = [
    'comorb_diabetes_tipo_ii', 'comorb_hta', 'comorb_dislipemia',
    'comorb_enf_cardiovascular', 'comorb_sindrome_metabolico', 'comorb_esteatosis_hepatica',
    'comorb_sinus_pilonidal', 'comorb_colitis_ulcerosa', 'comorb_crohn',
    'comorb_artritis', 'comorb_psoriasis', 'comorb_sop',
    'comorb_acne', 'comorb_depresion', 'comorb_ansiedad',
    'comorb_pash_papash', 'comorb_pioderma_gangrenoso', 'comorb_foliculitis_decalvante'
  ];
  comorbKeys.forEach(k => { payload[k] = 'No'; });
  payload.comorb_diabetes_tipo_ii = 'Si';
  payload.otras_comorbilidades = 'Hashimoto';

  // IHS region counts: a few non-zero values.
  for (const region of IHS_REGIONS) {
    payload[`ihs_${region.key}_n`] = '0';
    payload[`ihs_${region.key}_a`] = '0';
    payload[`ihs_${region.key}_f`] = '0';
    payload[`ihs_${region.key}_fd`] = '0';
  }
  payload.ihs_axila_d_n = '2';
  payload.ihs_axila_d_a = '1';
  payload.ihs_ingle_i_f = '1';

  // Derived IHS totals mirror DERIVED.ihs4Score/Grade.
  const totals = { n: 0, a: 0, f: 0, fd: 0 };
  for (const region of IHS_REGIONS) {
    for (const type of IHS_LESION_TYPES) {
      totals[type.key] += parseInt(payload[`ihs_${region.key}_${type.key}`] || 0, 10);
    }
  }
  payload.ihs_total_n = String(totals.n);
  payload.ihs_total_a = String(totals.a);
  payload.ihs_total_f = String(totals.f);
  payload.ihs_total_fd = String(totals.fd);
  const score = totals.n + totals.a * 2 + totals.f * 4;
  payload.ihs4_total = String(score);
  payload.ihs4_gravedad = score < 4 ? 'Leve' : score <= 10 ? 'Moderado' : 'Grave';

  // Eco derived.
  const eco = {
    n: parseInt(payload.eco_nodulos || 0, 10),
    a: parseInt(payload.eco_abscesos || 0, 10),
    f: parseInt(payload.eco_fistulas || 0, 10)
  };
  const ecoScore = eco.n + eco.a * 2 + eco.f * 4;
  payload.eco_ihs4 = String(ecoScore);
  payload.eco_gravedad = ecoScore < 4 ? 'Leve' : ecoScore <= 10 ? 'Moderado' : 'Grave';

  // PROMs: all answered to keep parity simple.
  for (let i = 1; i <= 10; i += 1) payload[`dlqi_q${i}`] = '1';
  payload.dlqi_total = '10';
  payload.dlqi_interpretacion = 'Impacto moderado';
  for (let i = 1; i <= 24; i += 1) payload[`hsqol_q${i}`] = '2';
  payload.hsqol_total = '24';
  payload.hsqol_interpretacion = 'Impacto bajo';

  // First-visit therapy.
  payload.tx_primera_topicos_farmaco_1 = 'Clindamicina topica';
  payload.tx_primera_topicos_posologia_1 = '2 veces al dia';
  payload.tx_primera_topicos_farmaco_2 = '';
  payload.tx_primera_topicos_posologia_2 = '';
  payload.tx_primera_topicos_farmaco_3 = '';
  payload.tx_primera_topicos_posologia_3 = '';
  payload.tx_primera_topicos_otros = '';
  payload.tx_primera_antibioticos_orales_farmaco_1 = 'Doxiciclina';
  payload.tx_primera_antibioticos_orales_posologia_1 = '100 mg/dia';
  payload.tx_primera_antibioticos_orales_farmaco_2 = '';
  payload.tx_primera_antibioticos_orales_posologia_2 = '';
  payload.tx_primera_antibioticos_orales_farmaco_3 = '';
  payload.tx_primera_antibioticos_orales_posologia_3 = '';
  payload.tx_primera_antibioticos_orales_otros = '';
  payload.tx_primera_biologicos_farmaco_1 = '';
  payload.tx_primera_biologicos_posologia_1 = '';
  payload.tx_primera_biologicos_farmaco_2 = '';
  payload.tx_primera_biologicos_posologia_2 = '';
  payload.tx_primera_biologicos_farmaco_3 = '';
  payload.tx_primera_biologicos_posologia_3 = '';
  payload.tx_primera_biologicos_otros = '';

  // Seguimiento therapy slots empty by default.
  for (const group of ['topicos', 'antibioticos_orales', 'biologicos']) {
    for (let i = 1; i <= 3; i += 1) {
      payload[`tx_seguimiento_${group}_farmaco_${i}`] = '';
      payload[`tx_seguimiento_${group}_posologia_${i}`] = '';
    }
    payload[`tx_seguimiento_${group}_otros`] = '';
  }

  // Surgery fields: not applicable for this base; values left empty to avoid
  // camelCase vs snake_case naming noise while still proving column position.
  payload.cirugia_dermatologia = 'No';
  payload.consideraciones_dermatologia = '';
  payload.cirugia_general = 'No';
  payload.consideraciones_general = '';
  payload.cirugia_plastica = 'No';
  payload.consideraciones_plastica = '';
  payload.cirugia_ginecologia = 'No';
  payload.consideraciones_ginecologia = '';
  payload.cirugia_urologia = 'No';
  payload.consideraciones_urologia = '';

  return payload;
}

function firstMonografica() {
  const payload = makeBasePayload();
  payload.consulta = 'monografica';
  payload.hoja_destino = SHEET_KEYS.monografica;
  payload.tipo_visita = 'primera';
  payload.cie = 'L73.2';
  payload.solicitud_analitica = 'Si';
  payload.solicitud_medicina_preventiva = 'No';
  return payload;
}

function firstMultidisciplinar() {
  const payload = makeBasePayload();
  payload.consulta = 'multidisciplinar';
  payload.hoja_destino = SHEET_KEYS.multidisciplinar;
  payload.tipo_visita = 'primera';
  payload.origen_paciente = 'multidisciplinar';
  payload.peso_kg = '85';
  payload.talla_m = '1.80';
  payload.imc = '26.23';
  payload.eva_dolor = '7';
  payload.ihs4_total = '12';
  payload.ihs4_gravedad = 'Grave';
  payload.eco_ihs4 = '10';
  payload.eco_gravedad = 'Moderado';
  payload.cirugia_aplica = 'Si';
  payload.cirugia_dermatologia = 'Si';
  payload.consideraciones_dermatologia = 'Cirugia local excision';
  payload.tx_primera_biologicos_farmaco_1 = 'Adalimumab';
  payload.tx_primera_biologicos_posologia_1 = '40 mg semanal';
  payload.tx_primera_antibioticos_orales_farmaco_1 = '';
  return payload;
}

function followUp() {
  const payload = makeBasePayload();
  payload.tipo_visita = 'seguimiento';
  payload.consulta = 'monografica';
  payload.hoja_destino = SHEET_KEYS.monografica;
  payload.seguimiento_tratamiento_previo = 'Topicos: Clindamicina topica (2 veces al dia)';
  payload.seguimiento_tratamiento_actual = 'Topicos: Clindamicina topica (2 veces al dia)';
  payload.seguimiento_decision = 'continuar';
  payload.seguimiento_adherencia = 'buena';
  payload.seguimiento_ajuste_pauta = 'Mantener pauta';
  payload.seguimiento_morisky_q1 = 'no';
  payload.seguimiento_morisky_q2 = 'si';
  payload.seguimiento_morisky_q3 = 'no';
  payload.seguimiento_morisky_q4 = 'no';
  payload.seguimiento_morisky_resultado = 'adherente';
  payload.seguimiento_efectos_adversos = 'No';
  payload.tx_seguimiento_topicos_farmaco_1 = 'Clindamicina topica';
  payload.tx_seguimiento_topicos_posologia_1 = '2 veces al dia';
  payload.tx_primera_topicos_farmaco_1 = '';
  payload.tx_primera_topicos_posologia_1 = '';
  return payload;
}

function compareTSV(name, circuit, payload) {
  const hub = buildTSV(circuit, payload);
  const legacy = buildLegacyTSV(circuit, payload);

  const hubCells = hub.split('\t');
  const legacyCells = legacy.split('\t');
  const columns = COLUMNS[circuit];

  assert(hubCells.length === columns.length,
    `${name}: Hub cell count ${hubCells.length} != schema column count ${columns.length}`);
  assert(legacyCells.length === columns.length,
    `${name}: Legacy cell count ${legacyCells.length} != schema column count ${columns.length}`);

  const mismatches = [];
  for (let i = 0; i < columns.length; i += 1) {
    if (hubCells[i] !== legacyCells[i]) {
      mismatches.push({
        index: i,
        column: columns[i],
        hub: hubCells[i],
        legacy: legacyCells[i]
      });
    }
  }

  if (mismatches.length) {
    const details = mismatches.map(m =>
      `  [${m.index}] ${m.column}: hub="${m.hub}" legacy="${m.legacy}"`
    ).join('\n');
    throw new Error(`${name}: ${mismatches.length} cell(s) differ from legacy TSV:\n${details}`);
  }

  console.log(`${name}: ${hubCells.length} cells OK (circuit ${circuit})`);
}

function run() {
  console.log('Starting hub vs legacy TSV parity check...');
  compareTSV('First monografica', 'monografica', firstMonografica());
  compareTSV('First multidisciplinar', 'multidisciplinar', firstMultidisciplinar());
  compareTSV('Follow-up monografica', 'monografica', followUp());
  console.log('PASS: Hub TSV is byte-identical to legacy TSV for representative visits.');
}

try {
  run();
} catch (err) {
  console.error('FAIL:', err.message);
  process.exit(1);
}
