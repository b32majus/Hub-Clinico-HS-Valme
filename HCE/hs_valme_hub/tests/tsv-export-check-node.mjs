/**
 * Lightweight Node runtime check for TSV export and validation.
 *
 * Verifies that buildTSV produces a one-row TSV aligned to the schema columns
 * and that required-field validation blocks malformed exports.
 */

import { COLUMNS, SHEET_KEYS, IHS_REGIONS, IHS_LESION_TYPES, HEADERS_HS_VERSION } from '../src/schema/hs_schema.js';
import { buildTSV, validatePayload, getDestinationSheet } from '../src/tsv/exporter.js';

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function makeValidPayload() {
  const base = {
    nusha: 'AN1234567890',
    fecha_visita: '2024-06-15',
    tipo_visita: 'primera',
    consulta: 'monografica',
    origen_paciente: 'derma_gral',
    antecedentes_familiares_hs: 'no',
    anio_inicio: '2010',
    fumador: 'no',
    sexo_nacimiento: 'femenino',
    anio_diagnostico: '2015',
    peso_kg: '70',
    talla_m: '1.65',
    eco_nodulos: '1',
    eco_abscesos: '0',
    eco_fistulas: '0',
    eco_doppler: 'no',
    eva_dolor: '3'
  };
  // DLQI and HSQoL answers
  for (let i = 1; i <= 10; i += 1) base[`dlqi_q${i}`] = '0';
  for (let i = 1; i <= 24; i += 1) base[`hsqol_q${i}`] = '0';
  // IHS region counts default to 0 (includes v2 cuero_cabelludo)
  for (const region of IHS_REGIONS) {
    for (const type of IHS_LESION_TYPES) {
      base[`ihs_${region.key}_${type.key}`] = '0';
    }
  }

  // V2 monographic fields
  base.comorb_acne_conglobata = 'no';
  base.edad_inicio = '20';
  base.nivel_educativo = 'Secundarios';
  base.fumador_estado = 'Nunca ha fumado';
  base.exfumador_anios = '';
  base.alcohol_consume = 'no';
  base.alcohol_cervezas_vino_semana = '';
  base.alcohol_copas_destilados_semana = '';
  base.alcohol_ube_semana = '';
  base.flares_total_ultimo_anio = '0';
  base.flares_desde_ultima_visita = '';
  base.flares_requirio_urgencias = 'no';
  base.flares_requirio_cirugia = 'no';
  base.flares_requirio_antibioticos = 'no';
  base.eva_prurito = '0';
  base.eva_olor = '0';
  base.eva_supuracion = '0';
  base.eco_hallazgos = '';

  return base;
}

function run() {
  console.log('Starting TSV export runtime check...');

  assert(HEADERS_HS_VERSION === 'v2', 'Expected HEADERS_HS_VERSION to be v2');

  for (const circuit of Object.keys(SHEET_KEYS)) {
    const payload = makeValidPayload();
    payload.consulta = circuit;
    const validation = validatePayload(payload, circuit);
    assert(validation.valid, `Expected valid payload for ${circuit}, got: ${validation.errors.join('; ')}`);

    const tsv = buildTSV(circuit, payload);
    const cells = tsv.split('\t');
    const columns = COLUMNS[circuit];
    assert(cells.length === columns.length, `${circuit}: expected ${columns.length} cells, got ${cells.length}`);
    assert(cells[0] === 'AN1234567890', `${circuit}: first cell should be NUSHA`);
    assert(getDestinationSheet(circuit) === SHEET_KEYS[circuit], `${circuit}: destination sheet mismatch`);

    // V2 column presence
    const evaPruritoIndex = columns.indexOf('eva_prurito');
    const flaresIndex = columns.indexOf('flares_total_ultimo_anio');
    const ecoHallazgosIndex = columns.indexOf('eco_hallazgos');
    assert(evaPruritoIndex > -1 && cells[evaPruritoIndex] === '0', `${circuit}: eva_prurito cell mismatch`);
    assert(flaresIndex > -1 && cells[flaresIndex] === '0', `${circuit}: flares_total_ultimo_anio cell mismatch`);
    assert(ecoHallazgosIndex > -1, `${circuit}: eco_hallazgos column missing`);

    console.log(`${SHEET_KEYS[circuit]} export: ${cells.length} cells OK`);
  }

  // Missing required field
  const invalidPayload = makeValidPayload();
  invalidPayload.nusha = '';
  const invalid = validatePayload(invalidPayload, 'monografica');
  assert(!invalid.valid, 'Expected validation to fail with missing NUSHA');
  assert(invalid.errors.some(e => e.includes('nusha')), 'Expected error message to mention nusha');

  // Bad NUSHA format
  const badNusha = makeValidPayload();
  badNusha.nusha = '12345';
  const bad = validatePayload(badNusha, 'monografica');
  assert(!bad.valid, 'Expected validation to fail with bad NUSHA');

  // EVA out of range
  const evaOutOfRange = makeValidPayload();
  evaOutOfRange.eva_prurito = '11';
  const evaValidation = validatePayload(evaOutOfRange, 'monografica');
  assert(!evaValidation.valid, 'Expected validation to fail with EVA prurito = 11');
  assert(evaValidation.errors.some(e => e.includes('EVA prurito')), 'Expected error message to mention EVA prurito');

  // Alcohol UBE derivation: export preserves the derived UBE value.
  const ubePayload = makeValidPayload();
  ubePayload.alcohol_consume = 'si';
  ubePayload.alcohol_cervezas_vino_semana = '3';
  ubePayload.alcohol_copas_destilados_semana = '2';
  ubePayload.alcohol_ube_semana = '7';
  const ubeValidation = validatePayload(ubePayload, 'monografica');
  assert(ubeValidation.valid, `Expected UBE payload to be valid, got: ${ubeValidation.errors.join('; ')}`);
  const ubeTsv = buildTSV('monografica', ubePayload);
  const ubeCells = ubeTsv.split('\t');
  const ubeIndex = COLUMNS.monografica.indexOf('alcohol_ube_semana');
  assert(ubeIndex > -1 && ubeCells[ubeIndex] === '7', `Expected UBE cell to be 7, got ${ubeCells[ubeIndex]}`);

  console.log('PASS: TSV export and validation behave as expected for v2 schema.');
}

try {
  run();
} catch (err) {
  console.error('FAIL:', err.message);
  process.exit(1);
}
