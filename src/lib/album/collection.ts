import type { Sticker, Team, SpecialSection, PersistedCollection } from "@/types/album.types";
import {
  ALBUM_STICKERS,
  BONUS_STICKERS,
  TEAMS,
  TEAMS_BY_GROUP,
  TOTAL_ALBUM_STICKERS,
  TOTAL_BONUS_STICKERS,
} from "@/constants/album";

export type Quantities = Record<string, number>;

export const COLLECTION_VERSION = 1;
export const COLLECTION_STORAGE_KEY = "panini-wc26-collection";

export type AlbumStats = {
  total: number;
  unique: number;
  missing: number;
  duplicates: number;
  totalCopies: number;
  /** 0–100 */
  percent: number;
};

export type TeamStats = AlbumStats & {
  isComplete: boolean;
};

export function clampQuantity(value: number): number {
  if (!Number.isFinite(value) || value < 0) return 0;
  return Math.floor(value);
}

export function getQuantity(quantities: Quantities, code: string): number {
  const raw = quantities[code];
  return clampQuantity(raw ?? 0);
}

function statsForStickers(stickers: Sticker[], quantities: Quantities): AlbumStats {
  let unique = 0;
  let duplicates = 0;
  let totalCopies = 0;
  for (const sticker of stickers) {
    const qty = getQuantity(quantities, sticker.code);
    totalCopies += qty;
    if (qty >= 1) unique += 1;
    if (qty >= 2) duplicates += qty - 1;
  }
  const total = stickers.length;
  const missing = total - unique;
  const percent = total === 0 ? 0 : Math.round((unique / total) * 100);
  return { total, unique, missing, duplicates, totalCopies, percent };
}

export function computeAlbumStats(quantities: Quantities): AlbumStats {
  return statsForStickers(ALBUM_STICKERS, quantities);
}

export function computeBonusStats(quantities: Quantities): AlbumStats {
  return statsForStickers(BONUS_STICKERS, quantities);
}

export function computeTeamStats(team: Team, quantities: Quantities): TeamStats {
  const base = statsForStickers(team.stickers, quantities);
  return { ...base, isComplete: base.unique === base.total && base.total > 0 };
}

export function computeFwcStats(fwcStickers: Sticker[], quantities: Quantities): AlbumStats {
  return statsForStickers(fwcStickers, quantities);
}

export function countCompletedTeams(quantities: Quantities): number {
  return TEAMS.reduce((acc, team) => {
    const stats = computeTeamStats(team, quantities);
    return acc + (stats.isComplete ? 1 : 0);
  }, 0);
}

export function incrementSticker(quantities: Quantities, code: string): Quantities {
  return { ...quantities, [code]: getQuantity(quantities, code) + 1 };
}

export function decrementSticker(quantities: Quantities, code: string): Quantities {
  const next = getQuantity(quantities, code) - 1;
  return { ...quantities, [code]: next < 0 ? 0 : next };
}

export function setStickerQuantity(
  quantities: Quantities,
  code: string,
  value: number
): Quantities {
  return { ...quantities, [code]: clampQuantity(value) };
}

export function toggleSticker(quantities: Quantities, code: string): Quantities {
  return setStickerQuantity(quantities, code, getQuantity(quantities, code) === 0 ? 1 : 0);
}

/**
 * Mark every missing sticker in a team as owned (qty 1). Preserves duplicates:
 * any sticker with qty >= 1 keeps its current quantity.
 */
export function markTeamComplete(team: Team, quantities: Quantities): Quantities {
  const next = { ...quantities };
  for (const sticker of team.stickers) {
    if (getQuantity(next, sticker.code) === 0) {
      next[sticker.code] = 1;
    }
  }
  return next;
}

export function isGroupComplete(group: string, quantities: Quantities): boolean {
  const teams = TEAMS_BY_GROUP[group] ?? [];
  if (teams.length === 0) return false;
  return teams.every((team) => computeTeamStats(team, quantities).isComplete);
}

/** Mark every missing sticker in all teams of a group as owned (qty 1). */
export function markGroupComplete(group: string, quantities: Quantities): Quantities {
  const teams = TEAMS_BY_GROUP[group] ?? [];
  return teams.reduce((acc, team) => markTeamComplete(team, acc), quantities);
}

/** Mark every missing sticker in a section as owned (qty 1). */
export function markSectionComplete(
  section: Pick<SpecialSection, "stickers">,
  quantities: Quantities
): Quantities {
  const next = { ...quantities };
  for (const sticker of section.stickers) {
    if (getQuantity(next, sticker.code) === 0) {
      next[sticker.code] = 1;
    }
  }
  return next;
}

export function clearTeam(team: Team, quantities: Quantities): Quantities {
  const next = { ...quantities };
  for (const sticker of team.stickers) {
    next[sticker.code] = 0;
  }
  return next;
}

export function buildExport(quantities: Quantities): PersistedCollection {
  return {
    version: COLLECTION_VERSION,
    updatedAt: new Date().toISOString(),
    quantities: { ...quantities },
  };
}

export class CollectionImportError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CollectionImportError";
  }
}

/**
 * Validate an unknown JSON payload as a PersistedCollection.
 * Returns sanitized quantities (only known codes, non-negative ints).
 * Throws CollectionImportError if the shape is wrong.
 */
export function validateImport(raw: unknown): Quantities {
  if (!raw || typeof raw !== "object") {
    throw new CollectionImportError("Payload must be an object");
  }
  const obj = raw as Record<string, unknown>;
  if (typeof obj.version !== "number") {
    throw new CollectionImportError("Missing version");
  }
  if (!obj.quantities || typeof obj.quantities !== "object") {
    throw new CollectionImportError("Missing quantities map");
  }
  const incoming = obj.quantities as Record<string, unknown>;
  const knownCodes = new Set<string>([
    ...ALBUM_STICKERS.map((s) => s.code),
    ...BONUS_STICKERS.map((s) => s.code),
  ]);
  const result: Quantities = {};
  for (const [code, value] of Object.entries(incoming)) {
    if (!knownCodes.has(code)) continue;
    if (typeof value !== "number") continue;
    const safe = clampQuantity(value);
    if (safe > 0) result[code] = safe;
  }
  return result;
}

export function buildMissingTxt(quantities: Quantities): string {
  const missing: string[] = [];
  for (const sticker of ALBUM_STICKERS) {
    if (getQuantity(quantities, sticker.code) === 0) missing.push(sticker.code);
  }
  return missing.join("\n");
}

export function buildDuplicatesCsv(quantities: Quantities): string {
  const rows: string[] = ["code,duplicates"];
  for (const sticker of ALBUM_STICKERS) {
    const qty = getQuantity(quantities, sticker.code);
    const dup = Math.max(0, qty - 1);
    if (dup > 0) rows.push(`${sticker.code},${dup}`);
  }
  return rows.join("\n");
}

type ExcelRow = {
  section: string;
  group: string;
  team: string;
  code: string;
  quantity: number;
  status: "missing" | "owned" | "duplicate";
  duplicates: number;
};

function statusFor(qty: number): ExcelRow["status"] {
  if (qty === 0) return "missing";
  if (qty === 1) return "owned";
  return "duplicate";
}

/**
 * Build inventory rows for the entire album + bonus.
 * Used by both Excel and rich CSV exports.
 */
export function buildExcelRows(quantities: Quantities): ExcelRow[] {
  const rows: ExcelRow[] = [];
  const teamByCode = new Map<string, { name: string; group: string }>();
  for (const team of TEAMS) {
    teamByCode.set(team.code, { name: team.name, group: team.group });
  }

  for (const sticker of ALBUM_STICKERS) {
    const qty = getQuantity(quantities, sticker.code);
    let section = "Album";
    let team = "";
    let group = "";
    if (sticker.category === "LOGO") section = "Panini logo";
    else if (sticker.category === "FWC") section = "FWC";
    else if (sticker.category === "TEAM") {
      const teamCode = sticker.code.replace(/\d+$/, "");
      section = "Team";
      const t = teamByCode.get(teamCode);
      if (t) {
        team = `${t.name} (${teamCode})`;
        group = t.group;
      } else team = teamCode;
    }
    rows.push({
      section,
      group,
      team,
      code: sticker.code,
      quantity: qty,
      status: statusFor(qty),
      duplicates: Math.max(0, qty - 1),
    });
  }
  for (const sticker of BONUS_STICKERS) {
    const qty = getQuantity(quantities, sticker.code);
    rows.push({
      section: "Coca-Cola bonus",
      group: "",
      team: "",
      code: sticker.code,
      quantity: qty,
      status: statusFor(qty),
      duplicates: Math.max(0, qty - 1),
    });
  }
  return rows;
}

function csvCell(value: string | number): string {
  const str = String(value);
  // Always quote — safe with commas, quotes, newlines, leading +/=/-/@.
  return `"${str.replace(/"/g, '""')}"`;
}

/**
 * Build an Excel-friendly CSV.
 * - Starts with UTF-8 BOM so Excel reads accents/non-ASCII correctly.
 * - CRLF line endings (Excel convention).
 * - All fields quoted so embedded commas/newlines are safe.
 *
 * Suffix the file with `.csv`. Excel, Numbers, and Google Sheets open this
 * natively with a double-click.
 */
export function buildExcelCsv(quantities: Quantities): string {
  const rows = buildExcelRows(quantities);
  const header = ["Section", "Group", "Team", "Code", "Quantity", "Status", "Duplicates"];
  const lines: string[] = [];
  lines.push(header.map(csvCell).join(","));
  for (const r of rows) {
    lines.push(
      [r.section, r.group, r.team, r.code, r.quantity, r.status, r.duplicates]
        .map(csvCell)
        .join(",")
    );
  }
  // UTF-8 BOM + CRLF lines.
  return "﻿" + lines.join("\r\n") + "\r\n";
}

export { TOTAL_ALBUM_STICKERS, TOTAL_BONUS_STICKERS };
