/**
 * Lightweight Node runtime check for the stale-base fix.
 *
 * Verifies that loading an invalid workbook after a valid one clears the
 * previous base from memory, mirroring the contract of handleBaseFile() in
 * src/main.js.
 */

import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const XLSX = require('xlsx');

// src/excel/loader.js reads XLSX from window/globalThis in browser environments.
globalThis.XLSX = XLSX;
globalThis.window = globalThis;

const { store } = await import('../src/store.js');
const { loadBase } = await import('../src/excel/loader.js');

function makeXlsxFile(sheets, name) {
  const wb = XLSX.utils.book_new();
  for (const [sheetName, rows] of Object.entries(sheets)) {
    const ws = XLSX.utils.aoa_to_sheet(rows);
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
  }
  const array = XLSX.write(wb, { type: 'array', bookType: 'xlsx' });
  return new File([array], name, {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  });
}

// Mirrors handleBaseFile() error handling from src/main.js.
async function handleBaseFile(file) {
  try {
    const result = await loadBase(file);
    store.setBase(result);
  } catch (err) {
    store.clearBase();
    store.setError(err.message);
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function run() {
  console.log('Starting stale-base runtime check...');

  const validFile = makeXlsxFile({
    Monografica: [
      ['nusha', 'fecha_visita', 'tipo_visita', 'consulta', 'origen_paciente'],
      ['AN1234567890', '2024-01-15', 'primera', 'monografica', 'derma_gral']
    ],
    Multidisciplinar: [
      ['nusha', 'fecha_visita', 'tipo_visita', 'consulta', 'origen_paciente'],
      ['AN1234567890', '2024-02-20', 'primera', 'multidisciplinar', 'monografica']
    ]
  }, 'valid.xlsx');

  const invalidFile = makeXlsxFile({
    OtraHoja: [['foo', 'bar'], ['1', '2']]
  }, 'invalid.xlsx');

  await handleBaseFile(validFile);
  const baseAfterValid = store.getBase();
  assert(baseAfterValid !== null, 'Expected base to be set after valid workbook load.');
  console.log(`Valid load: Monografica=${baseAfterValid.counts.monografica}, Multidisciplinar=${baseAfterValid.counts.multidisciplinar}`);

  await handleBaseFile(invalidFile);
  const baseAfterInvalid = store.getBase();
  const errorAfterInvalid = store.getError();

  assert(baseAfterInvalid === null, `Stale base was NOT cleared: ${JSON.stringify(baseAfterInvalid)}`);
  assert(errorAfterInvalid !== null && errorAfterInvalid.length > 0, 'Expected an error message after invalid workbook load.');

  console.log(`Invalid load cleared base and stored error: "${errorAfterInvalid}"`);
  console.log('PASS: Stale base is cleared after invalid workbook error.');
}

run().catch(err => {
  console.error('FAIL:', err.message);
  process.exit(1);
});
