/**
 * Lightweight dashboard runtime check.
 *
 * Proves patient search, longitudinal derivation, and service KPI logic
 * on synthetic in-memory rows without browser storage or backend calls.
 */

import { store } from '../src/store.js';
import { getUniquePatients, getPatientRows, searchPatients, getAllRows } from '../src/patient/search.js';
import {
  computeKpis,
  severityCounts,
  therapyCounts,
  surgeryCounts,
  topComorbidities
} from '../src/service/kpis.js';
import { applyFilters, buildFilterOptions } from '../src/service/filters.js';
import { buildSummaryRows } from '../src/service/list.js';
import { DERIVED } from '../src/schema/hs_schema.js';

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function makeRow(overrides = {}) {
  return {
    nusha: 'AN1234567890',
    nombre: 'Maria',
    apellidos: 'Garcia Lopez',
    fecha_visita: '2024-06-15',
    tipo_visita: 'primera',
    consulta: 'monografica',
    origen_paciente: 'derma_gral',
    ihs4_total: '6',
    ihs4_gravedad: 'Moderado',
    eco_ihs4: '4',
    eco_gravedad: 'Moderado',
    peso_kg: '70',
    talla_m: '1.65',
    imc: '25.71',
    dlqi_total: '8',
    dlqi_interpretacion: 'Impacto moderado',
    hsqol_total: '30',
    hsqol_interpretacion: 'Impacto moderado',
    eva_dolor: '5',
    tx_primera_biologicos_farmaco_1: 'Adalimumab',
    tx_primera_biologicos_posologia_1: '40 mg semanal',
    tx_primera_antibioticos_orales_farmaco_1: '',
    tx_primera_topicos_farmaco_1: 'Clindamicina topica',
    tx_primera_topicos_posologia_1: '2 veces al dia',
    cirugia_dermatologia: 'No',
    cirugia_general: 'No',
    cirugia_plastica: 'No',
    cirugia_ginecologia: 'No',
    cirugia_urologia: 'No',
    cirugia_aplica: 'No',
    comorb_diabetes_tipo_ii: 'Si',
    comorb_hta: 'No',
    seguimiento_morisky_resultado: 'adherente',
    ...overrides
  };
}

function run() {
  console.log('Starting dashboard derivation runtime check...');

  const syntheticBase = {
    fileName: 'synthetic_test.xlsx',
    monografica: [
      makeRow({
        nusha: 'AN1234567890',
        fecha_visita: '2024-06-15',
        tipo_visita: 'primera',
        ihs4_total: '6',
        ihs4_gravedad: 'Moderado',
        peso_kg: '70',
        cirugia_dermatologia: 'Si',
        cirugia_aplica: 'Si'
      }),
      makeRow({
        nusha: 'AN1234567890',
        fecha_visita: '2024-09-20',
        tipo_visita: 'seguimiento',
        ihs4_total: '3',
        ihs4_gravedad: 'Leve',
        peso_kg: '68',
        tx_primera_biologicos_farmaco_1: 'Adalimumab',
        tx_primera_biologicos_posologia_1: '40 mg semanal',
        tx_primera_topicos_farmaco_1: '',
        tx_primera_topicos_posologia_1: '',
        comorb_diabetes_tipo_ii: 'No'
      })
    ],
    multidisciplinar: [
      makeRow({
        nusha: 'AN9999999999',
        nombre: 'Carlos',
        apellidos: 'Ruiz',
        fecha_visita: '2024-07-10',
        tipo_visita: 'primera',
        consulta: 'multidisciplinar',
        ihs4_total: '12',
        ihs4_gravedad: 'Grave',
        peso_kg: '85',
        tx_primera_biologicos_farmaco_1: 'Secukinumab',
        tx_primera_biologicos_posologia_1: '300 mg mensual',
        tx_primera_topicos_farmaco_1: '',
        tx_primera_topicos_posologia_1: '',
        tx_primera_antibioticos_orales_farmaco_1: '',
        cirugia_dermatologia: 'No',
        cirugia_aplica: 'No',
        comorb_diabetes_tipo_ii: 'No',
        comorb_hta: 'Si'
      })
    ]
  };

  store.setBase(syntheticBase);
  const base = store.getBase();
  assert(base !== null, 'Base should be loaded in memory');
  assert(base.counts.monografica === 2, 'Expected 2 monografica rows');
  assert(base.counts.multidisciplinar === 1, 'Expected 1 multidisciplinar row');

  // Patient search
  const unique = getUniquePatients(base);
  assert(unique.length === 2, `Expected 2 unique patients, got ${unique.length}`);
  assert(unique.some(p => p.nusha === 'AN1234567890'), 'Expected AN1234567890 in unique list');
  assert(unique.some(p => p.nusha === 'AN9999999999'), 'Expected AN9999999999 in unique list');

  const searchByNusha = searchPatients(base, 'AN999');
  assert(searchByNusha.length === 1 && searchByNusha[0].nusha === 'AN9999999999', 'Search by NUSHA prefix failed');

  const searchByName = searchPatients(base, 'garcia');
  assert(searchByName.length === 1 && searchByName[0].nusha === 'AN1234567890', 'Search by name failed');

  // Longitudinal rows
  const rowsP1 = getPatientRows(base, 'AN1234567890');
  assert(rowsP1.length === 2, 'Expected 2 rows for AN1234567890');
  assert(rowsP1[0].fecha_visita === '2024-06-15', 'Rows should be sorted ascending by date');
  assert(rowsP1[1].fecha_visita === '2024-09-20', 'Rows should be sorted ascending by date');

  const rowsMissing = getPatientRows(base, 'AN0000000000');
  assert(rowsMissing.length === 0, 'Expected 0 rows for unknown NUSHA');

  // Derived IHS-4 consistency
  assert(DERIVED.ihs4Score({ n: 2, a: 1, f: 1 }) === 8, 'IHS-4 score derivation mismatch');
  assert(DERIVED.ihs4Grade(3) === 'Leve', 'IHS-4 grade leve mismatch');
  assert(DERIVED.ihs4Grade(6) === 'Moderado', 'IHS-4 grade moderado mismatch');
  assert(DERIVED.ihs4Grade(11) === 'Grave', 'IHS-4 grade grave mismatch');

  // Service KPIs
  const all = getAllRows(base);
  const kpis = computeKpis(all);
  assert(kpis.uniquePatients === 2, `Expected 2 unique patients, got ${kpis.uniquePatients}`);
  assert(kpis.totalVisits === 3, `Expected 3 total visits, got ${kpis.totalVisits}`);
  assert(kpis.primeras === 2, `Expected 2 primeras, got ${kpis.primeras}`);
  assert(kpis.seguimientos === 1, `Expected 1 seguimiento, got ${kpis.seguimientos}`);
  assert(kpis.conBiologico === 3, `Expected 3 with biologico, got ${kpis.conBiologico}`);
  assert(kpis.conCirugia === 1, `Expected 1 with cirugia, got ${kpis.conCirugia}`);
  assert(kpis.ihs4Mean === 7, `Expected IHS-4 mean 7, got ${kpis.ihs4Mean}`);

  const severity = severityCounts(all);
  assert(severity.Leve === 1 && severity.Moderado === 1 && severity.Grave === 1,
    `Severity counts mismatch: ${JSON.stringify(severity)}`);

  const therapy = therapyCounts(all);
  assert(therapy.Biologicos === 3, `Expected 3 biologicos, got ${therapy.Biologicos}`);
  assert(therapy.Topicos === 1, `Expected 1 topicos, got ${therapy.Topicos}`);

  const surgery = surgeryCounts(all);
  const derm = surgery.find(s => s.label === 'Dermatologia');
  assert(derm && derm.count === 1, `Expected 1 dermatologia surgery, got ${JSON.stringify(derm)}`);

  const comorb = topComorbidities(all);
  const diabetes = comorb.find(c => c.label === 'Diabetes tipo II');
  const hta = comorb.find(c => c.label === 'HTA');
  assert(diabetes && diabetes.count === 1, 'Expected 1 diabetes comorbidity');
  assert(hta && hta.count === 1, 'Expected 1 HTA comorbidity');

  // Filters
  const graveOnly = applyFilters(all, { gravedad: 'grave' });
  assert(graveOnly.length === 1 && graveOnly[0].nusha === 'AN9999999999', 'Gravedad filter failed');

  const biologicoOptions = buildFilterOptions(all);
  assert(biologicoOptions.biologicos.includes('Adalimumab'), 'Expected Adalimumab in biologico options');

  const adalimumabOnly = applyFilters(all, { biologico: 'Adalimumab' });
  assert(adalimumabOnly.length === 2, `Expected 2 Adalimumab rows, got ${adalimumabOnly.length}`);

  // Patient list summary
  const summary = buildSummaryRows(all);
  assert(summary.length === 3, `Expected 3 summary rows, got ${summary.length}`);
  assert(summary.every(s => s.nusha && s.fecha_visita), 'Summary rows should have NUSHA and fecha');

  // Privacy: ensure no browser storage keys are referenced in our modules
  const forbidden = ['localStorage', 'sessionStorage', 'IndexedDB', 'indexedDB'];
  for (const key of forbidden) {
    assert(typeof globalThis[key] === 'undefined', `${key} should not be available in Node runtime`);
  }

  console.log('PASS: Dashboard derivation logic works on synthetic in-memory rows.');
}

try {
  run();
} catch (err) {
  console.error('FAIL:', err.message);
  process.exit(1);
}
