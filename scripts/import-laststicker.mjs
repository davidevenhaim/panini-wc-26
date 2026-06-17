#!/usr/bin/env node
// scripts/import-laststicker.mjs
//
// LastSticker checklist → album JSON importer.
//
// Web scraping is not performed here. The user must provide a structured
// dump of the LastSticker checklist as JSON or CSV. The two accepted
// shapes are documented in docs/laststicker-import.md.
//
// Usage:
//   node scripts/import-laststicker.mjs <input> --meta <album-meta.json> --out <album.json> [--format json|csv]
//
// `--format` auto-detects from the file extension if omitted.
//
// The script does NOT alter any registered album. Review the produced
// JSON, then wire it into src/data/world-cup/<slug>/items.ts and flip
// dataStatus/layout once the reconciliation report is clean.

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve, extname } from "node:path";

function die(msg) {
  console.error(`[import-laststicker] ${msg}`);
  process.exit(1);
}

function parseArgs(argv) {
  const args = { input: null, out: null, meta: null, format: null };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--out") args.out = argv[++i];
    else if (a === "--meta") args.meta = argv[++i];
    else if (a === "--format") args.format = argv[++i];
    else if (!a.startsWith("--")) args.input = a;
  }
  return args;
}

/* ── CSV parser (mirrors src/lib/album/csv.ts) ────────────────────────── */

function parseCsv(raw) {
  const text = raw.replace(/^﻿/, "");
  const rows = [];
  let cur = "";
  let row = [];
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"' && text[i + 1] === '"') {
        cur += '"';
        i++;
      } else if (ch === '"') inQuotes = false;
      else cur += ch;
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
      } else cur += ch;
    }
  }
  if (cur !== "" || row.length > 0) {
    row.push(cur);
    if (row.some((v) => v !== "")) rows.push(row);
  }
  return rows;
}

function rowsToObjects(rows) {
  if (rows.length === 0) return [];
  const header = rows[0].map((h) => h.trim());
  return rows.slice(1).map((r) => {
    const o = {};
    for (let i = 0; i < header.length; i++) o[header[i]] = (r[i] ?? "").trim();
    return o;
  });
}

/* ── Normalisation ─────────────────────────────────────────────────────── */

function localized(en, he) {
  const out = {};
  if (en) out.en = en;
  if (he) out.he = he;
  return Object.keys(out).length === 0 ? undefined : out;
}

function asInt(v, fallback) {
  if (v === "" || v == null) return fallback;
  const n = Number.parseInt(v, 10);
  return Number.isFinite(n) ? n : fallback;
}

/**
 * Normalize one input row → CollectibleItem shape (+ section info).
 * Common columns:
 *   code, displayNumber, order, sectionId, sectionTitleEn, sectionTitleHe,
 *   sectionEntityType, sectionFlag, sectionBadge, sectionOrder,
 *   name, playerName, teamName, category, isRequired, availability, sourceUrl
 *
 * Where `name`, `playerName`, `teamName` can be either plain strings or
 * `<value>|<he-value>` (pipe separator) for bilingual entries.
 */
function pickLocalized(value) {
  if (!value) return undefined;
  const [en, he] = String(value)
    .split("|")
    .map((s) => s.trim());
  return localized(en, he);
}

function normalizeRow(raw, meta, indexInSection) {
  const code = raw.code || raw.printedNumber || raw.number;
  if (!code) throw new Error(`row missing code: ${JSON.stringify(raw)}`);
  const sectionId = raw.sectionId || raw.section || "default";
  return {
    section: {
      id: sectionId,
      title: localized(raw.sectionTitleEn, raw.sectionTitleHe) ?? { en: sectionId },
      order: asInt(raw.sectionOrder, 0),
      entityType: raw.sectionEntityType || "OTHER",
      flag: raw.sectionFlag || undefined,
      badge: raw.sectionBadge || undefined,
    },
    item: {
      id: `${meta.id}::${code}`,
      albumId: meta.id,
      sectionId,
      code: String(code),
      displayNumber: raw.displayNumber ? String(raw.displayNumber) : String(code),
      order: asInt(raw.order, indexInSection + 1),
      name: pickLocalized(raw.name),
      playerName: pickLocalized(raw.playerName),
      teamName: pickLocalized(raw.teamName),
      category: raw.category || undefined,
      isRequiredForCompletion:
        (raw.isRequired ?? raw.required ?? "true").toString().toLowerCase() !== "false",
      availability: raw.availability || "PACK",
    },
  };
}

function buildAlbum(rows, meta) {
  if (!meta) die("--meta <album-meta.json> is required");
  const sections = new Map();
  const seenCodes = new Set();
  const ordered = [];

  let indexInSection = 0;
  let lastSectionId = null;
  for (const raw of rows) {
    const { section, item } = normalizeRow(raw, meta, indexInSection);
    if (section.id !== lastSectionId) {
      indexInSection = 0;
      lastSectionId = section.id;
    }
    if (seenCodes.has(item.code)) {
      die(`duplicate code "${item.code}" in input — every code must be unique within the album`);
    }
    seenCodes.add(item.code);

    if (!sections.has(section.id)) {
      sections.set(section.id, {
        ...section,
        order: section.order || sections.size + 1,
        items: [],
      });
    }
    sections.get(section.id).items.push(item);
    ordered.push(item);
    indexInSection++;
  }

  const sectionList = [...sections.values()].sort((a, b) => a.order - b.order);
  return { ...meta, sections: sectionList, _itemCount: ordered.length };
}

/* ── Reconciliation summary ────────────────────────────────────────────── */

function reconcile(album, expectedItems) {
  const total = album.sections.reduce((acc, s) => acc + s.items.length, 0);
  const codes = album.sections.flatMap((s) => s.items.map((i) => i.code));
  const codeSet = new Set(codes);
  const duplicates = codes.filter((c, i, a) => a.indexOf(c) !== i);
  const numericCodes = codes
    .map((c) => Number.parseInt(c.replace(/[^0-9]/g, ""), 10))
    .filter((n) => Number.isFinite(n));
  const min = numericCodes.length ? Math.min(...numericCodes) : null;
  const max = numericCodes.length ? Math.max(...numericCodes) : null;
  const gaps = [];
  if (min !== null && max !== null) {
    const present = new Set(numericCodes);
    for (let n = min; n <= max; n++) {
      if (!present.has(n)) gaps.push(n);
    }
  }
  return {
    total,
    expected: expectedItems,
    uniqueCodes: codeSet.size,
    duplicates,
    minNumber: min,
    maxNumber: max,
    gaps,
    matchesExpected: expectedItems != null ? total === expectedItems : null,
  };
}

/* ── Driver ────────────────────────────────────────────────────────────── */

const args = parseArgs(process.argv);
if (!args.input) die("input file is required (JSON or CSV)");
if (!args.out) die("--out <output.json> is required");
const inputPath = resolve(args.input);
if (!existsSync(inputPath)) die(`input not found: ${inputPath}`);

const fmt = args.format ?? (extname(inputPath).toLowerCase() === ".csv" ? "csv" : "json");

/* ── Bundled-payload (pre-validated dump) builder ─────────────────────── */

const SECTION_TYPE_MAP = {
  INTRO: "INTRO",
  STADIUMS: "TOURNAMENT",
  OTHER: "OTHER",
  NATIONAL_TEAM: "NATIONAL_TEAM",
  HISTORY: "SPECIAL",
  TOURNAMENT: "TOURNAMENT",
  SPECIAL: "SPECIAL",
  PLAYER_CATEGORY: "PLAYER_CATEGORY",
  TEAM: "TEAM",
};

function mapEntityType(t) {
  return SECTION_TYPE_MAP[t] ?? "OTHER";
}

function isBundledPayload(payload) {
  return (
    payload &&
    typeof payload === "object" &&
    typeof payload.albumId === "string" &&
    Array.isArray(payload.sections) &&
    Array.isArray(payload.items) &&
    payload.sections.length > 0 &&
    typeof payload.sections[0]?.titleEn === "string"
  );
}

/**
 * Detect the flat `{album, total_stickers, stickers: [{id,name,team,type}]}`
 * shape (community dump format) and convert into the bundled payload the
 * rest of the importer understands. Sections are derived from the `team`
 * field in order of first appearance; section type is inferred from common
 * non-team labels (Intro, Stadiums, Host Cities, Legends, FIFA Museum).
 */
function isFlatStickerPayload(payload) {
  return (
    payload &&
    typeof payload === "object" &&
    Array.isArray(payload.stickers) &&
    payload.stickers.length > 0 &&
    typeof payload.stickers[0]?.id !== "undefined" &&
    typeof payload.stickers[0]?.team === "string"
  );
}

function slugify(value) {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function inferSectionType(team) {
  const t = String(team).toLowerCase();
  if (t === "intro" || t === "introduction") return "INTRO";
  if (t === "stadiums" || t === "stadium") return "STADIUMS";
  if (t === "host cities" || t === "host city") return "HOST_CITIES";
  if (t === "legends" || t === "history" || t.includes("museum")) return "HISTORY";
  return "NATIONAL_TEAM";
}

const TEAM_CODE_MAP = {
  Russia: "RUS",
  "Saudi Arabia": "KSA",
  Egypt: "EGY",
  Uruguay: "URU",
  Portugal: "POR",
  Spain: "ESP",
  Morocco: "MAR",
  Iran: "IRN",
  France: "FRA",
  Australia: "AUS",
  Peru: "PER",
  Denmark: "DEN",
  Argentina: "ARG",
  Iceland: "ISL",
  Croatia: "CRO",
  Nigeria: "NGA",
  Brazil: "BRA",
  Switzerland: "SUI",
  "Costa Rica": "CRC",
  Serbia: "SRB",
  Germany: "GER",
  Mexico: "MEX",
  Sweden: "SWE",
  "South Korea": "KOR",
  Belgium: "BEL",
  Panama: "PAN",
  Tunisia: "TUN",
  England: "ENG",
  Poland: "POL",
  Senegal: "SEN",
  Colombia: "COL",
  Japan: "JPN",
};

function categorizeFlatItem(stk, sectionType) {
  if (sectionType === "INTRO") return "INTRO";
  if (sectionType === "STADIUMS") return "STADIUM";
  if (sectionType === "HOST_CITIES") return "HOST_CITY";
  if (sectionType === "HISTORY") return "HISTORY";
  const name = String(stk.name ?? "");
  if (/badge|emblem|logo/i.test(name)) return "TEAM_LOGO";
  if (/team photo|squad/i.test(name)) return "TEAM_PHOTO";
  return "PLAYER";
}

function adaptFlatStickerPayload(payload, albumId) {
  const sections = new Map();
  let sectionOrder = 0;
  const items = [];

  for (const stk of payload.stickers) {
    const team = stk.team ?? "Default";
    if (!sections.has(team)) {
      sectionOrder += 1;
      const type = inferSectionType(team);
      const id = slugify(team);
      sections.set(team, {
        id,
        order: sectionOrder,
        titleEn: team,
        type,
        teamCode: type === "NATIONAL_TEAM" ? (TEAM_CODE_MAP[team] ?? id.toUpperCase()) : undefined,
      });
    }
    const meta = sections.get(team);
    const category = categorizeFlatItem(stk, meta.type);
    const isPlayer = category === "PLAYER";
    const code = String(stk.id);
    items.push({
      albumId,
      sectionId: meta.id,
      sectionOrder: meta.order,
      code,
      displayNumber: code,
      order: items.length + 1,
      titleEn: String(stk.name ?? ""),
      ...(isPlayer && stk.name ? { playerNameEn: String(stk.name) } : {}),
      ...(meta.type === "NATIONAL_TEAM" ? { teamNameEn: team } : {}),
      category,
      required: true,
      availability: "PACK",
    });
  }

  const sectionsArr = [...sections.values()].map((s) => ({
    id: s.id,
    order: s.order,
    titleEn: s.titleEn,
    type: s.type,
    ...(s.teamCode ? { teamCode: s.teamCode, teamNameEn: s.titleEn } : {}),
  }));

  return {
    albumId,
    edition: payload.edition ?? { market: "INTERNATIONAL", editionType: "STANDARD" },
    sections: sectionsArr,
    items,
    sources: payload.sources ?? [],
    validation: payload.validation ?? null,
  };
}

function buildFromBundle(payload) {
  const albumId = payload.albumId;
  const sectionMetaById = new Map(payload.sections.map((s) => [s.id, s]));
  const sectionsOut = new Map();
  const seenCodes = new Set();

  for (const it of payload.items) {
    if (!it.code) die(`row missing code: ${JSON.stringify(it)}`);
    if (seenCodes.has(it.code)) die(`duplicate code "${it.code}" in input`);
    seenCodes.add(it.code);
    const meta = sectionMetaById.get(it.sectionId);
    if (!meta) die(`item code ${it.code} references unknown section ${it.sectionId}`);

    if (!sectionsOut.has(meta.id)) {
      sectionsOut.set(meta.id, {
        id: meta.id,
        title: { en: meta.titleEn },
        order: meta.order ?? sectionsOut.size + 1,
        entityType: mapEntityType(meta.type),
        ...(meta.teamCode ? { badge: meta.teamCode } : {}),
        items: [],
      });
    }
    const section = sectionsOut.get(meta.id);
    const item = {
      id: `${albumId}:${it.code}`,
      albumId,
      sectionId: meta.id,
      code: String(it.code),
      displayNumber: it.displayNumber != null ? String(it.displayNumber) : String(it.code),
      order: typeof it.order === "number" ? it.order : section.items.length + 1,
      isRequiredForCompletion: it.required !== false,
      availability: it.availability ?? "PACK",
    };
    if (it.titleEn) item.name = { en: it.titleEn };
    if (it.playerNameEn) item.playerName = { en: it.playerNameEn };
    if (it.teamNameEn) item.teamName = { en: it.teamNameEn };
    if (it.category) item.category = it.category;
    section.items.push(item);
  }

  const sectionList = [...sectionsOut.values()].sort((a, b) => a.order - b.order);
  for (const s of sectionList) s.items.sort((a, b) => a.order - b.order);

  return {
    albumId,
    edition: payload.edition,
    sections: sectionList,
    sources: payload.sources ?? [],
    excludedItems: payload.validation?.excludedItems ?? [],
    validation: payload.validation ?? null,
  };
}

/* ── Driver ───────────────────────────────────────────────────────────── */

let rows = [];
let bundle = null;
const fileText = readFileSync(inputPath, "utf-8");
if (fmt === "json") {
  const raw = JSON.parse(fileText);
  if (isBundledPayload(raw)) {
    bundle = raw;
  } else if (isFlatStickerPayload(raw)) {
    const inferredId = raw.albumId ?? (raw.year ? `panini-world-cup-${raw.year}` : null);
    if (!inferredId) die("flat sticker payload must declare `albumId` or `year`");
    bundle = adaptFlatStickerPayload(raw, inferredId);
  } else if (Array.isArray(raw.items)) {
    rows = raw.items;
  } else {
    die("JSON input must be a bundled payload or contain an `items` array");
  }
} else if (fmt === "csv") {
  rows = rowsToObjects(parseCsv(fileText));
} else {
  die(`unsupported format: ${fmt}`);
}

let outPayload;
let expected;
let albumId;

if (bundle) {
  outPayload = buildFromBundle(bundle);
  expected = bundle.edition?.baseItemCount ?? bundle.validation?.expectedItems ?? null;
  albumId = bundle.albumId;
} else {
  if (!args.meta) die("--meta <album-meta.json> is required when input is not a bundled payload");
  const metaPath = resolve(args.meta);
  if (!existsSync(metaPath)) die(`meta not found: ${metaPath}`);
  const meta = JSON.parse(readFileSync(metaPath, "utf-8"));
  outPayload = buildAlbum(rows, meta);
  expected = meta.editions?.[0]?.baseItemCount ?? meta.totalItems ?? null;
  albumId = meta.id;
}

const recon = reconcile(outPayload, expected);

if (!recon.matchesExpected && expected != null) {
  console.error(
    `[import-laststicker] WARNING: extracted ${recon.total} items but expected ${expected}. ` +
      "Do NOT mark this album verified-complete."
  );
}

if ("_itemCount" in outPayload) delete outPayload._itemCount;
writeFileSync(resolve(args.out), JSON.stringify(outPayload, null, 2) + "\n", "utf-8");
const reportPath = resolve(args.out).replace(/\.json$/, ".reconcile.md");
writeFileSync(
  reportPath,
  [
    `# Reconciliation — ${albumId}`,
    "",
    `* Extracted items: **${recon.total}**`,
    `* Expected items: **${recon.expected ?? "—"}**`,
    `* Unique codes: **${recon.uniqueCodes}**`,
    `* Duplicate codes: ${recon.duplicates.length === 0 ? "none" : recon.duplicates.join(", ")}`,
    `* Numeric range: ${recon.minNumber ?? "—"} – ${recon.maxNumber ?? "—"}`,
    `* Numeric gaps: ${recon.gaps.length === 0 ? "none" : recon.gaps.join(", ")}`,
    `* Match: ${recon.matchesExpected === null ? "n/a" : recon.matchesExpected ? "yes" : "no"}`,
    "",
    `## Sections (${outPayload.sections.length})`,
    "",
    ...outPayload.sections.map(
      (s) => `* \`${s.id}\` — ${s.title?.en ?? s.id} — ${s.items.length} items`
    ),
    "",
  ].join("\n"),
  "utf-8"
);
// eslint-disable-next-line no-console
console.log(
  `[import-laststicker] Wrote ${args.out} (${recon.total} items) and reconciliation ${reportPath}`
);
