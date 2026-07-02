/**
 * Scope guard runtime check.
 *
 * Ensures the hub source does not contain nursing, multidisciplinary-nursing,
 * cure-post-Qx, or PsO route/module references. Also checks that no browser
 * persistence APIs are referenced in src/.
 */

import { readdir, readFile, stat } from 'fs/promises';
import { join, extname } from 'path';

const SRC_DIR = decodeURIComponent(new URL('../src', import.meta.url).pathname.replace(/^\//, ''));
const SRC_DIR_WIN = SRC_DIR.replace(/\//g, '\\');

const forbiddenRoutePatterns = [
  /enfermer/i,
  /cura\s*post/i,
  /post[-\s]?qx/i,
  /\bpso\b/i,
  /pso\//i
];

const forbiddenPersistencePatterns = [
  /localStorage\s*[.\[]/,
  /sessionStorage\s*[.\[]/,
  /indexedDB\s*[.\[]/,
  /IndexedDB\s*[.\[]/,
  /openDatabase\s*\(/ // legacy WebSQL fallback
];

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...await walk(full));
    } else if (entry.isFile() && ['.js', '.mjs', '.css', '.html'].includes(extname(entry.name))) {
      files.push(full);
    }
  }
  return files;
}

const allowedContextPatterns = [
  /comorb_psoriasis/ // legitimate HS comorbidity label, not a PsO module
];

function findMatches(content, patterns) {
  const matches = [];
  const lines = content.split(/\r?\n/);
  for (let i = 0; i < lines.length; i += 1) {
    if (allowedContextPatterns.some(p => p.test(lines[i]))) continue;
    for (const pattern of patterns) {
      if (pattern.test(lines[i])) {
        matches.push({ line: i + 1, text: lines[i].trim(), pattern: pattern.source });
      }
    }
  }
  return matches;
}

async function run() {
  console.log('Starting scope and privacy guard check...');

  const files = await walk(SRC_DIR_WIN);
  assert(files.length > 0, `No source files found in ${SRC_DIR_WIN}`);

  let routeHits = [];
  let persistenceHits = [];

  for (const file of files) {
    const content = await readFile(file, 'utf-8');
    routeHits.push(...findMatches(content, forbiddenRoutePatterns).map(m => ({ ...m, file })));
    persistenceHits.push(...findMatches(content, forbiddenPersistencePatterns).map(m => ({ ...m, file })));
  }

  if (routeHits.length) {
    const details = routeHits.map(h => `  ${h.file}:${h.line} [${h.pattern}] ${h.text}`).join('\n');
    throw new Error(`Scope guard failed: nursing/PsO references found in hub src/:\n${details}`);
  }

  if (persistenceHits.length) {
    const details = persistenceHits.map(h => `  ${h.file}:${h.line} [${h.pattern}] ${h.text}`).join('\n');
    throw new Error(`Privacy guard failed: browser persistence references found in hub src/:\n${details}`);
  }

  console.log(`PASS: No nursing/PsO route references and no browser persistence APIs in ${files.length} source file(s).`);
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

try {
  await run();
} catch (err) {
  console.error('FAIL:', err.message);
  process.exit(1);
}
