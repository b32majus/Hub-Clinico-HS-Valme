/**
 * Lightweight Node runtime check for TSV export and validation.
 *
 * Verifies that buildTSV produces a one-row TSV aligned to the schema columns
 * and that required-field validation blocks malformed exports.
 */

import { COLUMNS, SHEET_KEYS } from '../src/schema/hs_schema.js';
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
  // IHS region counts default to 0
  const regions = [
    'axila_d', 'axila_i', 'ingle_d', 'ingle_i', 'gluteo_d', 'gluteo_i',
    'muslo_d', 'muslo_i', 'mama_d', 'mama_i', 'intermamaria', 'genital', 'perianal', 'otras'
  ];
  for (const r of regions) {
    base[`ihs_${r}_n`] = '0';
    base[`ihs_${r}_a`] = '0';
    base[`ihs_${r}_f`] = '0';
    base[`ihs_${r}_fd`] = '0';
  }
  return base;
}

function run() {
  console.log('Starting TSV export runtime check...');

  for (const circuit of Object.keys(SHEET_KEYS)) {
    const payload = makeValidPayload();
    payload.consulta = circuit;
    const validation = validatePayload(payload, circuit);
    assert(validation.valid, `Expected valid payload for ${circuit}, got: ${validation.errors.join('; ')}`);

    const tsv = buildTSV(circuit, payload);
    const cells = tsv.split('\t');
    assert(cells.length === COLUMNS[circuit].length, `${circuit}: expected ${COLUMNS[circuit].length} cells, got ${cells.length}`);
    assert(cells[0] === 'AN1234567890', `${circuit}: first cell should be NUSHA`);
    assert(getDestinationSheet(circuit) === SHEET_KEYS[circuit], `${circuit}: destination sheet mismatch`);
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

  console.log('PASS: TSV export and validation behave as expected.');
}

try {
  run();
} catch (err) {
  console.error('FAIL:', err.message);
  process.exit(1);
}
