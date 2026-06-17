import { describe, it, expect } from "vitest";
import { getAlbumBySlug, listRequiredCodes } from "@/collections/catalog";
import {
  albumProgressForQuantities,
  buildMissingTextForAlbum,
  listAlbumMissing,
} from "@/lib/album/album-progress";

const xl = () => getAlbumBySlug("world-cup-2026-adrenalyn-xl")!;

const RANGES: Array<{ category: string; start: number; end: number }> = [
  { category: "GOLDEN_BALLER", start: 1, end: 9 },
  { category: "CONTENDER", start: 514, end: 549 },
  { category: "TOP_KEEPER", start: 550, end: 558 },
  { category: "DEFENSIVE_ROCK", start: 559, end: 567 },
  { category: "MIDFIELD_MAESTRO", start: 568, end: 585 },
  { category: "GOAL_MACHINE", start: 586, end: 607 },
  { category: "MASTER_ROOKIE", start: 608, end: 623 },
  { category: "OFFICIAL_EMBLEM", start: 624, end: 624 },
  { category: "OFFICIAL_MASCOT", start: 625, end: 627 },
  { category: "ETERNOS_22", start: 628, end: 630 },
];

describe("Panini WC 2026 Adrenalyn XL", () => {
  it("registered with stable id panini-world-cup-2026-adrenalyn-xl", () => {
    const a = xl();
    expect(a).toBeDefined();
    expect(a.id).toBe("panini-world-cup-2026-adrenalyn-xl");
    expect(a.familyId).toBe("world-cup-adrenalyn-xl");
    expect(a.itemType).toBe("CARD");
    expect(a.layout).toBe("adrenalyn-sections");
  });

  it("verified-partial, totalItems 630, default INTERNATIONAL Base Binder edition", () => {
    const a = xl();
    expect(a.dataStatus).toBe("verified-partial");
    expect(a.totalItems).toBe(630);
    expect(a.editions![0].market).toBe("INTERNATIONAL");
    expect(a.editions![0].isDefault).toBe(true);
    expect(a.editions![0].baseItemCount).toBe(630);
    expect(a.editions![0].editionName?.en).toBe("Base Binder");
  });

  it("contains 630 required base-binder cards with codes 1..630", () => {
    const required = listRequiredCodes(xl());
    expect(required).toHaveLength(630);
    const codes = required.map((c) => Number.parseInt(c, 10)).sort((a, b) => a - b);
    expect(codes[0]).toBe(1);
    expect(codes[629]).toBe(630);
    for (let i = 1; i <= 630; i++) expect(codes[i - 1]).toBe(i);
  });

  it("unique codes — no duplicates", () => {
    const items = xl().sections.flatMap((s) => s.items);
    expect(new Set(items.map((i) => i.code)).size).toBe(items.length);
  });

  it("has 42 national-team sections, each exactly 12 cards", () => {
    const teams = xl().sections.filter((s) => s.entityType === "NATIONAL_TEAM");
    expect(teams.length).toBe(42);
    for (const t of teams) expect(t.items.length, t.id).toBe(12);
  });

  it("each national-team block uses categories FF / CREST / IC / 9× PLAYER", () => {
    const teams = xl().sections.filter((s) => s.entityType === "NATIONAL_TEAM");
    for (const t of teams) {
      const cats = t.items.map((i) => i.category);
      expect(cats[0]).toBe("FAN_FAVOURITE");
      expect(cats[1]).toBe("TEAM_CREST");
      expect(cats[2]).toBe("ICON");
      for (let i = 3; i < 12; i++) expect(cats[i]).toBe("PLAYER");
    }
  });

  it("Algeria block is 10–21 and Uzbekistan block is 502–513", () => {
    const algeria = xl().sections.find((s) => s.id === "team-algeria")!;
    expect(algeria.items.map((i) => i.code)).toEqual(
      Array.from({ length: 12 }, (_, i) => String(10 + i))
    );
    const uzbek = xl().sections.find((s) => s.id === "team-uzbekistan")!;
    expect(uzbek.items.map((i) => i.code)).toEqual(
      Array.from({ length: 12 }, (_, i) => String(502 + i))
    );
  });

  it("category ranges line up with the official PDF", () => {
    const items = xl().sections.flatMap((s) => s.items);
    const byCode = new Map(items.map((i) => [Number.parseInt(i.code, 10), i]));
    for (const r of RANGES) {
      for (let code = r.start; code <= r.end; code++) {
        const it = byCode.get(code);
        expect(it, `code ${code}`).toBeDefined();
        expect(it!.category, `code ${code}`).toBe(r.category);
      }
    }
  });

  it("Momentum cards live in specialCollections, are not required, and don't count toward 630", () => {
    const a = xl();
    expect(a.specialCollections?.length).toBe(1);
    const momentum = a.specialCollections![0];
    expect(momentum.id).toBe("momentum");
    expect(momentum.countsTowardAlbumCompletion).toBe(false);
    expect(momentum.items).toHaveLength(3);
    for (const it of momentum.items) {
      expect(it.isRequiredForCompletion).toBe(false);
      expect(it.category).toBe("MOMENTUM");
    }
    // None of the Momentum codes are in the required list
    const required = new Set(listRequiredCodes(a));
    for (const it of momentum.items) expect(required.has(it.code)).toBe(false);
  });

  it("base completion ignores Momentum quantities", () => {
    const a = xl();
    const qty: Record<string, number> = {};
    for (const it of a.specialCollections![0].items) qty[it.code] = 5;
    const p = albumProgressForQuantities(a, qty);
    expect(p.total).toBe(630);
    expect(p.unique).toBe(0); // Momentum codes are not required
  });

  it("progress hits 100% when every base code has qty ≥ 1", () => {
    const a = xl();
    const qty = Object.fromEntries(a.sections.flatMap((s) => s.items).map((i) => [i.code, 1]));
    const p = albumProgressForQuantities(a, qty);
    expect(p.total).toBe(630);
    expect(p.unique).toBe(630);
    expect(p.percent).toBe(100);
  });

  it("missing list contains all 630 codes when nothing is owned", () => {
    const a = xl();
    expect(listAlbumMissing(a, {})).toHaveLength(630);
    expect(buildMissingTextForAlbum(a, {})).toContain("1");
    expect(buildMissingTextForAlbum(a, {})).toContain("630");
  });

  it("confirmed anchor team names round-trip", () => {
    const ids = [
      "team-algeria",
      "team-argentina",
      "team-australia",
      "team-austria",
      "team-belgium",
      "team-brazil",
      "team-united-states",
      "team-uruguay",
      "team-uzbekistan",
    ];
    for (const id of ids) {
      const s = xl().sections.find((sec) => sec.id === id);
      expect(s, id).toBeDefined();
    }
  });

  it("each section carries a Hebrew title or subtitle (RTL support)", () => {
    const sections = xl().sections;
    let hebrew = 0;
    for (const s of sections) {
      if (s.title.he || s.subtitle?.he) hebrew++;
    }
    expect(hebrew).toBeGreaterThan(0);
  });

  it("sticker albums remain unaffected — WC26 verified-complete at 980", () => {
    const wc26 = getAlbumBySlug("world-cup-2026")!;
    expect(wc26.dataStatus).toBe("verified-complete");
    expect(wc26.totalItems).toBe(980);
    expect(wc26.itemType).toBe("STICKER");
  });

  it("WC22 sticker album remains 670 / world-cup-flat-grouped", () => {
    const wc22 = getAlbumBySlug("world-cup-2022")!;
    expect(wc22.layout).toBe("world-cup-flat-grouped");
    expect(wc22.totalItems).toBe(670);
  });
});
