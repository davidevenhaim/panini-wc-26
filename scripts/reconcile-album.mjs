#!/usr/bin/env node
// scripts/reconcile-album.mjs
//
// Read an album JSON and emit a reconciliation report (stdout + .reconcile.md).
//
// Checks:
//   - total items vs editions[0].baseItemCount and totalItems
//   - unique codes (lists duplicates)
//   - numeric gaps (lists numeric subset)
//   - section sums vs total
//   - per-item required flag presence
//
// Usage: node scripts/reconcile-album.mjs <album.json> [--out <report.md>]

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

function die(msg) {
  console.error(`[reconcile] ${msg}`);
  process.exit(1);
}

function parseArgs(argv) {
  const args = { input: null, out: null };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--out") args.out = argv[++i];
    else if (!a.startsWith("--")) args.input = a;
  }
  return args;
}

const args = parseArgs(process.argv);
if (!args.input) die("input album JSON path is required");
const inputPath = resolve(args.input);
if (!existsSync(inputPath)) die(`not found: ${inputPath}`);

const album = JSON.parse(readFileSync(inputPath, "utf-8"));
const albumId = album.id ?? album.albumId ?? "unknown";
const albumStatus = album.dataStatus ?? album.validation?.status ?? "unknown";
const albumLayout = album.layout ?? "unknown";
const sections = album.sections ?? [];
const allItems = sections.flatMap((s) => s.items ?? []);
const codes = allItems.map((i) => i.code);
const uniqueCodes = new Set(codes);
const duplicates = codes.filter((c, i, a) => a.indexOf(c) !== i);
const expected = album.editions?.[0]?.baseItemCount ?? album.totalItems ?? null;

const numericPart = (code) => {
  const m = String(code).match(/\d+/);
  return m ? Number.parseInt(m[0], 10) : null;
};
const numerics = codes.map(numericPart).filter((n) => n != null);
const min = numerics.length ? Math.min(...numerics) : null;
const max = numerics.length ? Math.max(...numerics) : null;
const present = new Set(numerics);
const gaps = [];
if (min != null && max != null) {
  for (let n = min; n <= max; n++) if (!present.has(n)) gaps.push(n);
}

const missingRequiredFlag = allItems.filter((i) => i.isRequiredForCompletion == null).length;

const sectionSummaries = sections.map((s) => ({
  id: s.id,
  title: s.title?.en ?? s.id,
  count: s.items?.length ?? 0,
}));
const sectionSum = sectionSummaries.reduce((acc, s) => acc + s.count, 0);

const lines = [
  `# Reconciliation — ${albumId}`,
  "",
  `* Status: **${albumStatus}**`,
  `* Layout: **${albumLayout}**`,
  `* Total items: **${allItems.length}**`,
  `* Expected (edition.baseItemCount / totalItems): **${expected ?? "—"}**`,
  `* Unique codes: **${uniqueCodes.size}**`,
  `* Duplicate codes: ${duplicates.length === 0 ? "none" : duplicates.join(", ")}`,
  `* Numeric range: ${min ?? "—"} – ${max ?? "—"}`,
  `* Numeric gaps: ${gaps.length === 0 ? "none" : gaps.length > 30 ? `${gaps.slice(0, 30).join(", ")} … (+${gaps.length - 30} more)` : gaps.join(", ")}`,
  `* Items missing isRequiredForCompletion: ${missingRequiredFlag}`,
  `* Section sum equals total: ${sectionSum === allItems.length ? "yes" : `no (${sectionSum} vs ${allItems.length})`}`,
  "",
  `## Sections (${sections.length})`,
  "",
  ...sectionSummaries.map((s) => `* \`${s.id}\` — ${s.title} — ${s.count}`),
  "",
];
const report = lines.join("\n");

if (args.out) {
  writeFileSync(resolve(args.out), report, "utf-8");
} else {
  const out = inputPath.replace(/\.json$/, ".reconcile.md");
  writeFileSync(out, report, "utf-8");
  // eslint-disable-next-line no-console
  console.log(`[reconcile] Wrote ${out}`);
}
// eslint-disable-next-line no-console
console.log(report);

if (expected != null && expected !== allItems.length) {
  // eslint-disable-next-line no-console
  console.error(`[reconcile] FAIL — extracted ${allItems.length} != expected ${expected}`);
  process.exit(2);
}
if (duplicates.length > 0) {
  // eslint-disable-next-line no-console
  console.error(`[reconcile] FAIL — duplicate codes found`);
  process.exit(2);
}
