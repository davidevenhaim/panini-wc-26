import type { Sticker, Team, PersistedCollection } from "@/types/album.types";
import {
  ALBUM_STICKERS,
  BONUS_STICKERS,
  TEAMS,
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

function escapeXml(value: string | number): string {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

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

/**
 * Build SpreadsheetML 2003 XML — Excel opens it natively without any
 * runtime dependency. Suffix the file with `.xls`.
 */
export function buildExcelXml(quantities: Quantities): string {
  const rows = buildExcelRows(quantities);
  const header = ["Section", "Group", "Team", "Code", "Quantity", "Status", "Duplicates"];

  const cell = (value: string | number, type: "String" | "Number") =>
    `<Cell><Data ss:Type="${type}">${escapeXml(value)}</Data></Cell>`;

  const headerRow = `<Row>${header
    .map((h) => `<Cell ss:StyleID="hdr"><Data ss:Type="String">${escapeXml(h)}</Data></Cell>`)
    .join("")}</Row>`;

  const dataRows = rows
    .map(
      (r) =>
        `<Row>${cell(r.section, "String")}${cell(r.group, "String")}${cell(
          r.team,
          "String"
        )}${cell(r.code, "String")}${cell(r.quantity, "Number")}${cell(
          r.status,
          "String"
        )}${cell(r.duplicates, "Number")}</Row>`
    )
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
 <Styles>
  <Style ss:ID="hdr"><Font ss:Bold="1"/><Interior ss:Color="#E5E7EB" ss:Pattern="Solid"/></Style>
 </Styles>
 <Worksheet ss:Name="Panini WC 2026">
  <Table>${headerRow}${dataRows}</Table>
 </Worksheet>
</Workbook>`;
}

export { TOTAL_ALBUM_STICKERS, TOTAL_BONUS_STICKERS };
