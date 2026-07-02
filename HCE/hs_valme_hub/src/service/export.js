import { toCsv, toTsvSummary } from './list.js';
import { copyToClipboard } from '../tsv/clipboard.js';

export function downloadText(content, fileName, mimeType = 'text/csv;charset=utf-8;') {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

export function downloadFilteredCsv(rows, circuit = 'hs') {
  const csv = toCsv(rows);
  if (!csv) return false;
  downloadText(csv, `hs_valme_${circuit}_filtrado_secundario.csv`);
  return true;
}

export async function copyFilteredSummary(rows) {
  const tsv = toTsvSummary(rows);
  if (!tsv) return false;
  await copyToClipboard(tsv);
  return true;
}
