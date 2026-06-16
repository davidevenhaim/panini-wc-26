"use client";

import {
  buildDuplicatesCsv,
  buildExcelCsv,
  buildExport,
  buildMissingTxt,
  type Quantities,
} from "@/lib/album/collection";

function downloadFile(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function isoDate() {
  return new Date().toISOString().slice(0, 10);
}

export function exportJson(quantities: Quantities) {
  downloadFile(
    `panini-wc26-${isoDate()}.json`,
    JSON.stringify(buildExport(quantities), null, 2),
    "application/json"
  );
}

export function exportMissingTxt(quantities: Quantities) {
  downloadFile(`panini-wc26-missing-${isoDate()}.txt`, buildMissingTxt(quantities), "text/plain");
}

export function exportDuplicatesCsv(quantities: Quantities) {
  downloadFile(
    `panini-wc26-duplicates-${isoDate()}.csv`,
    buildDuplicatesCsv(quantities),
    "text/csv"
  );
}

export function exportExcel(quantities: Quantities) {
  // UTF-8 CSV with BOM — Excel, Numbers and Google Sheets open it natively.
  // CSV avoids the format-mismatch warnings that older SpreadsheetML XML
  // triggers in modern Excel.
  downloadFile(`panini-wc26-${isoDate()}.csv`, buildExcelCsv(quantities), "text/csv;charset=utf-8");
}
