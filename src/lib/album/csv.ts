/**
 * Minimal CSV parser used by the album importer. Handles:
 *   - UTF-8 BOM stripping
 *   - quoted cells with `""` for embedded quotes
 *   - LF, CR, CRLF line endings
 *   - skipping fully-empty rows
 *
 * The parser is intentionally small; for richer needs swap in a real CSV lib.
 */
export function parseCsv(raw: string): string[][] {
  const text = raw.replace(/^﻿/, "");
  const rows: string[][] = [];
  let cur = "";
  let row: string[] = [];
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"' && text[i + 1] === '"') {
        cur += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        cur += ch;
      }
    } else {
      if (ch === '"') inQuotes = true;
      else if (ch === ",") {
        row.push(cur);
        cur = "";
      } else if (ch === "\n" || ch === "\r") {
        if (ch === "\r" && text[i + 1] === "\n") i++;
        row.push(cur);
        cur = "";
        if (row.some((v) => v !== "")) rows.push(row);
        row = [];
      } else {
        cur += ch;
      }
    }
  }
  if (cur !== "" || row.length > 0) {
    row.push(cur);
    if (row.some((v) => v !== "")) rows.push(row);
  }
  return rows;
}

/** Convert parsed rows to a list of `{ [header]: value }` objects. */
export function rowsToObjects(rows: string[][]): Record<string, string>[] {
  if (rows.length === 0) return [];
  const header = rows[0].map((h) => h.trim());
  return rows.slice(1).map((r) => {
    const o: Record<string, string> = {};
    for (let i = 0; i < header.length; i++) o[header[i]] = (r[i] ?? "").trim();
    return o;
  });
}
