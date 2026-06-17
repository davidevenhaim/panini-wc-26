#!/usr/bin/env node
// scripts/import-checklist.mjs
//
// CSV -> album JSON importer.
//
// Reads a UTF-8 CSV file describing one album and emits a JSON file matching
// the AlbumSchema shape declared in src/collections/schema.ts.
//
// Usage:
//   node scripts/import-checklist.mjs <input.csv> --out <album.json> [--meta <meta.json>]
//
// CSV columns (header row required, order does not matter):
//   section_id            internal id for the section (e.g. "team-mac")
//   section_title_en      English section title
//   section_title_he      Hebrew section title (optional)
//   section_entity_type   one of TEAM | NATIONAL_TEAM | INTRO | TOURNAMENT |
//                                  PLAYER_CATEGORY | SPECIAL | OTHER
//   section_flag          emoji / flag glyph (optional)
//   section_badge         short letters for the badge (optional)
//   section_order         integer ordering inside the album
//   code                  unique sticker code (required)
//   display_number        printed number on the sticker (optional)
//   name_en               sticker / player name in English (optional)
//   name_he               sticker / player name in Hebrew (optional)
//   player_name_en        if different from name (optional)
//   player_name_he        (optional)
//   team_name_en          (optional)
//   team_name_he          (optional)
//   category              free-form category (optional)
//   item_order            integer ordering inside the section
//   required              "true" | "false" (default true)
//   availability          PACK | PROMO | SPECIAL | UNKNOWN (optional)
//
// Album-level metadata is supplied via a sidecar JSON (--meta path), which
// merges into the output album record. The CSV only carries items.
//
// The output is *not* automatically wired into the catalog — review and
// register it manually in src/data/...

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

function die(msg) {
  console.error(`[import-checklist] ${msg}`);
  process.exit(1);
}

function parseArgs(argv) {
  const args = { input: null, out: null, meta: null };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--out") args.out = argv[++i];
    else if (a === "--meta") args.meta = argv[++i];
    else if (!a.startsWith("--")) args.input = a;
  }
  return args;
}

function parseCsv(raw) {
  // strip UTF-8 BOM
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

function rowsToObjects(rows) {
  if (rows.length === 0) die("CSV is empty");
  const header = rows[0].map((h) => h.trim());
  return rows.slice(1).map((r) => {
    const o = {};
    for (let i = 0; i < header.length; i++) {
      o[header[i]] = (r[i] ?? "").trim();
    }
    return o;
  });
}

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

function buildAlbum(items, meta) {
  if (!meta) die("--meta <album-meta.json> is required");
  const sectionsMap = new Map();
  const seenCodes = new Set();

  for (const it of items) {
    if (!it.code) die("Row missing required column: code");
    if (seenCodes.has(it.code)) die(`Duplicate code in CSV: ${it.code}`);
    seenCodes.add(it.code);

    const sid = it.section_id || die(`Row ${it.code} missing section_id`);
    if (!sectionsMap.has(sid)) {
      sectionsMap.set(sid, {
        id: sid,
        title: localized(it.section_title_en, it.section_title_he) ?? { en: sid },
        order: asInt(it.section_order, sectionsMap.size + 1),
        entityType: it.section_entity_type || "OTHER",
        ...(it.section_flag ? { flag: it.section_flag } : {}),
        ...(it.section_badge ? { badge: it.section_badge } : {}),
        items: [],
      });
    }
    const section = sectionsMap.get(sid);
    const item = {
      id: `${meta.id}::${it.code}`,
      albumId: meta.id,
      sectionId: sid,
      code: it.code,
      order: asInt(it.item_order, section.items.length + 1),
      isRequiredForCompletion: (it.required ?? "true").toLowerCase() !== "false",
    };
    const dn = it.display_number;
    if (dn) item.displayNumber = dn;
    const name = localized(it.name_en, it.name_he);
    if (name) item.name = name;
    const player = localized(it.player_name_en, it.player_name_he);
    if (player) item.playerName = player;
    const team = localized(it.team_name_en, it.team_name_he);
    if (team) item.teamName = team;
    if (it.category) item.category = it.category;
    if (it.availability) item.availability = it.availability;
    section.items.push(item);
  }

  const sections = [...sectionsMap.values()].sort((a, b) => a.order - b.order);
  for (const s of sections) s.items.sort((a, b) => a.order - b.order);

  return { ...meta, sections };
}

const args = parseArgs(process.argv);
if (!args.input) die("Input CSV path is required");
if (!args.out) die("--out <output.json> is required");
const inputPath = resolve(args.input);
if (!existsSync(inputPath)) die(`Input not found: ${inputPath}`);

let meta = null;
if (args.meta) {
  const metaPath = resolve(args.meta);
  if (!existsSync(metaPath)) die(`Meta not found: ${metaPath}`);
  meta = JSON.parse(readFileSync(metaPath, "utf-8"));
}

const raw = readFileSync(inputPath, "utf-8");
const rows = parseCsv(raw);
const items = rowsToObjects(rows);
const album = buildAlbum(items, meta);
const out = resolve(args.out);
writeFileSync(out, JSON.stringify(album, null, 2) + "\n", "utf-8");
// eslint-disable-next-line no-console
console.log(
  `[import-checklist] Wrote ${out} (${items.length} items, ${album.sections.length} sections)`
);
