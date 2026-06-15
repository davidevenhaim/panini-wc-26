import { describe, it, expect } from "vitest";
import {
  TEAMS,
  ALBUM_STICKERS,
  BONUS_STICKERS,
  TOTAL_ALBUM_STICKERS,
  TOTAL_BONUS_STICKERS,
  PANINI_LOGO_SECTION,
  FWC_OPENING_SECTION,
  FWC_CLOSING_SECTION,
} from "@/constants/album";
import {
  buildExport,
  buildMissingTxt,
  buildDuplicatesCsv,
  clampQuantity,
  clearTeam,
  CollectionImportError,
  computeAlbumStats,
  computeBonusStats,
  computeFwcStats,
  countCompletedTeams,
  decrementSticker,
  getQuantity,
  incrementSticker,
  markTeamComplete,
  setStickerQuantity,
  toggleSticker,
  validateImport,
} from "@/lib/album/collection";

describe("album dataset", () => {
  it("has 48 teams in alphabetical group order", () => {
    expect(TEAMS).toHaveLength(48);
    expect(TEAMS[0].code).toBe("MEX");
    expect(TEAMS[47].code).toBe("PAN");
  });

  it("has 20 stickers per team with prefixed codes", () => {
    for (const team of TEAMS) {
      expect(team.stickers).toHaveLength(20);
      expect(team.stickers[0].code).toBe(`${team.code}1`);
      expect(team.stickers[19].code).toBe(`${team.code}20`);
    }
  });

  it("totals exactly 980 main-album stickers", () => {
    // 1 LOGO + 8 FWC opening + 960 team + 11 FWC closing = 980
    expect(PANINI_LOGO_SECTION.stickers).toHaveLength(1);
    expect(FWC_OPENING_SECTION.stickers).toHaveLength(8);
    expect(FWC_CLOSING_SECTION.stickers).toHaveLength(11);
    expect(ALBUM_STICKERS).toHaveLength(980);
    expect(TOTAL_ALBUM_STICKERS).toBe(980);
  });

  it("has 12 bonus stickers that do not count toward album", () => {
    expect(BONUS_STICKERS).toHaveLength(12);
    expect(TOTAL_BONUS_STICKERS).toBe(12);
  });

  it("uses FWC codes that are contiguous 1..19", () => {
    const fwcCodes = [
      ...FWC_OPENING_SECTION.stickers.map((s) => s.code),
      ...FWC_CLOSING_SECTION.stickers.map((s) => s.code),
    ];
    expect(fwcCodes).toEqual(Array.from({ length: 19 }, (_, i) => `FWC${i + 1}`));
  });
});

describe("quantity operations", () => {
  it("clamps invalid input to non-negative integer", () => {
    expect(clampQuantity(-1)).toBe(0);
    expect(clampQuantity(2.7)).toBe(2);
    expect(clampQuantity(Number.NaN)).toBe(0);
  });

  it("increment increases quantity by 1", () => {
    const next = incrementSticker({ MEX1: 1 }, "MEX1");
    expect(getQuantity(next, "MEX1")).toBe(2);
  });

  it("decrement never goes below zero", () => {
    const next = decrementSticker({ MEX1: 0 }, "MEX1");
    expect(getQuantity(next, "MEX1")).toBe(0);
  });

  it("toggle flips between 0 and 1, ignoring duplicates", () => {
    expect(getQuantity(toggleSticker({}, "MEX1"), "MEX1")).toBe(1);
    expect(getQuantity(toggleSticker({ MEX1: 3 }, "MEX1"), "MEX1")).toBe(0);
  });

  it("setStickerQuantity clamps invalid values", () => {
    const next = setStickerQuantity({}, "MEX1", -5);
    expect(getQuantity(next, "MEX1")).toBe(0);
  });
});

describe("team operations", () => {
  const team = TEAMS[0]; // Mexico

  it("markTeamComplete preserves duplicates and fills missing", () => {
    const q = { [`${team.code}1`]: 3, [`${team.code}2`]: 0 };
    const next = markTeamComplete(team, q);
    expect(next[`${team.code}1`]).toBe(3); // unchanged
    expect(next[`${team.code}2`]).toBe(1); // filled
    expect(next[`${team.code}20`]).toBe(1); // filled
  });

  it("clearTeam zeros all stickers in team", () => {
    const q = { [`${team.code}1`]: 5, [`${team.code}2`]: 1 };
    const next = clearTeam(team, q);
    expect(next[`${team.code}1`]).toBe(0);
    expect(next[`${team.code}2`]).toBe(0);
  });
});

describe("aggregate stats", () => {
  it("computes album stats: unique, missing, duplicates", () => {
    const q: Record<string, number> = { MEX1: 1, MEX2: 3, FWC1: 2 };
    const stats = computeAlbumStats(q);
    expect(stats.total).toBe(980);
    expect(stats.unique).toBe(3);
    expect(stats.missing).toBe(977);
    expect(stats.duplicates).toBe(3); // (3-1) + (2-1) = 3
  });

  it("bonus stickers do not count toward album", () => {
    const q = { BNS1: 1, MEX1: 1 };
    expect(computeAlbumStats(q).unique).toBe(1);
    expect(computeBonusStats(q).unique).toBe(1);
  });

  it("countCompletedTeams returns number of fully owned teams", () => {
    const q: Record<string, number> = {};
    for (const s of TEAMS[0].stickers) q[s.code] = 1;
    expect(countCompletedTeams(q)).toBe(1);
  });

  it("FWC stats count both opening and closing sets together", () => {
    const stickers = [...FWC_OPENING_SECTION.stickers, ...FWC_CLOSING_SECTION.stickers];
    const stats = computeFwcStats(stickers, { FWC1: 1, FWC9: 1 });
    expect(stats.total).toBe(19);
    expect(stats.unique).toBe(2);
  });
});

describe("import / export", () => {
  it("buildExport produces versioned JSON", () => {
    const exported = buildExport({ MEX1: 2 });
    expect(exported.version).toBe(1);
    expect(exported.quantities.MEX1).toBe(2);
    expect(typeof exported.updatedAt).toBe("string");
  });

  it("validateImport accepts a known shape and strips unknown codes", () => {
    const sanitized = validateImport({
      version: 1,
      updatedAt: "2026-01-01T00:00:00.000Z",
      quantities: { MEX1: 2, FAKE99: 5, FWC2: -1 },
    });
    expect(sanitized.MEX1).toBe(2);
    expect(sanitized.FAKE99).toBeUndefined();
    expect(sanitized.FWC2).toBeUndefined();
  });

  it("validateImport rejects bad shape", () => {
    expect(() => validateImport(null)).toThrow(CollectionImportError);
    expect(() => validateImport({ version: 1 })).toThrow(CollectionImportError);
    expect(() => validateImport({ quantities: {} })).toThrow(CollectionImportError);
  });

  it("missing TXT lists only missing codes", () => {
    const txt = buildMissingTxt({ MEX1: 1 });
    const lines = txt.split("\n");
    expect(lines).not.toContain("MEX1");
    expect(lines).toContain("MEX2");
    expect(lines).toContain("FWC1");
  });

  it("buildExcelRows produces row per sticker with status + duplicates", async () => {
    const { buildExcelRows } = await import("@/lib/album/collection");
    const rows = buildExcelRows({ MEX1: 3, FWC1: 1, LOGO: 0 });
    const mexRow = rows.find((r) => r.code === "MEX1");
    const fwcRow = rows.find((r) => r.code === "FWC1");
    const logoRow = rows.find((r) => r.code === "LOGO");
    expect(mexRow?.status).toBe("duplicate");
    expect(mexRow?.duplicates).toBe(2);
    expect(mexRow?.team).toContain("Mexico");
    expect(mexRow?.group).toBe("A");
    expect(fwcRow?.status).toBe("owned");
    expect(logoRow?.status).toBe("missing");
    expect(rows).toHaveLength(980 + 12);
  });

  it("buildExcelXml produces valid SpreadsheetML wrapper", async () => {
    const { buildExcelXml } = await import("@/lib/album/collection");
    const xml = buildExcelXml({ MEX1: 1 });
    expect(xml).toContain("<?xml");
    expect(xml).toContain("<Workbook");
    expect(xml).toContain("Panini WC 2026");
    expect(xml).toContain("MEX1");
  });

  it("duplicates CSV lists qty - 1", () => {
    const csv = buildDuplicatesCsv({ MEX1: 3, MEX2: 1, FWC1: 2 });
    const lines = csv.split("\n");
    expect(lines[0]).toBe("code,duplicates");
    expect(lines).toContain("MEX1,2");
    expect(lines).toContain("FWC1,1");
    expect(lines).not.toContain("MEX2,0");
  });
});
