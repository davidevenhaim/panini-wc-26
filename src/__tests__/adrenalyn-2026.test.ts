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

const EXPECTED_TEAMS: Array<{ slug: string; nameEn: string; start: number }> = [
  { slug: "algeria", nameEn: "Algeria", start: 10 },
  { slug: "argentina", nameEn: "Argentina", start: 22 },
  { slug: "australia", nameEn: "Australia", start: 34 },
  { slug: "austria", nameEn: "Austria", start: 46 },
  { slug: "belgium", nameEn: "Belgium", start: 58 },
  { slug: "brazil", nameEn: "Brazil", start: 70 },
  { slug: "canada", nameEn: "Canada", start: 82 },
  { slug: "cape-verde", nameEn: "Cape Verde", start: 94 },
  { slug: "colombia", nameEn: "Colombia", start: 106 },
  { slug: "croatia", nameEn: "Croatia", start: 118 },
  { slug: "cura-ao", nameEn: "Curaçao", start: 130 }, // slugify drops ç
  { slug: "ecuador", nameEn: "Ecuador", start: 142 },
  { slug: "egypt", nameEn: "Egypt", start: 154 },
  { slug: "england", nameEn: "England", start: 166 },
  { slug: "france", nameEn: "France", start: 178 },
  { slug: "germany", nameEn: "Germany", start: 190 },
  { slug: "ghana", nameEn: "Ghana", start: 202 },
  { slug: "haiti", nameEn: "Haiti", start: 214 },
  { slug: "iran", nameEn: "Iran", start: 226 },
  { slug: "ivory-coast", nameEn: "Ivory Coast", start: 238 },
  { slug: "japan", nameEn: "Japan", start: 250 },
  { slug: "jordan", nameEn: "Jordan", start: 262 },
  { slug: "korea-republic", nameEn: "Korea Republic", start: 274 },
  { slug: "mexico", nameEn: "Mexico", start: 286 },
  { slug: "morocco", nameEn: "Morocco", start: 298 },
  { slug: "netherlands", nameEn: "Netherlands", start: 310 },
  { slug: "new-zealand", nameEn: "New Zealand", start: 322 },
  { slug: "norway", nameEn: "Norway", start: 334 },
  { slug: "panama", nameEn: "Panama", start: 346 },
  { slug: "paraguay", nameEn: "Paraguay", start: 358 },
  { slug: "portugal", nameEn: "Portugal", start: 370 },
  { slug: "qatar", nameEn: "Qatar", start: 382 },
  { slug: "saudi-arabia", nameEn: "Saudi Arabia", start: 394 },
  { slug: "scotland", nameEn: "Scotland", start: 406 },
  { slug: "senegal", nameEn: "Senegal", start: 418 },
  { slug: "south-africa", nameEn: "South Africa", start: 430 },
  { slug: "spain", nameEn: "Spain", start: 442 },
  { slug: "switzerland", nameEn: "Switzerland", start: 454 },
  { slug: "tunisia", nameEn: "Tunisia", start: 466 },
  { slug: "united-states", nameEn: "United States", start: 478 },
  { slug: "uruguay", nameEn: "Uruguay", start: 490 },
  { slug: "uzbekistan", nameEn: "Uzbekistan", start: 502 },
];

describe("Panini WC 2026 Adrenalyn XL — base binder", () => {
  it("registered: id, family, layout, itemType", () => {
    const a = xl();
    expect(a.id).toBe("panini-world-cup-2026-adrenalyn-xl");
    expect(a.familyId).toBe("world-cup-adrenalyn-xl");
    expect(a.itemType).toBe("CARD");
    expect(a.layout).toBe("adrenalyn-sections");
  });

  it("verified-complete, totalItems 630, binderCapacity 720, completionScope BASE_BINDER", () => {
    const a = xl();
    expect(a.dataStatus).toBe("verified-complete");
    expect(a.verification?.status).toBe("verified-complete");
    expect(a.totalItems).toBe(630);
    expect(a.binderCapacity).toBe(720);
    expect(a.completionScope).toBe("BASE_BINDER");
  });

  it("binderCapacity does not affect completion total", () => {
    const a = xl();
    const required = listRequiredCodes(a);
    expect(required).toHaveLength(630);
    expect(required).not.toHaveLength(a.binderCapacity ?? 0);
  });

  it("default INTERNATIONAL Base Binder edition baseItemCount 630", () => {
    const ed = xl().editions![0];
    expect(ed.market).toBe("INTERNATIONAL");
    expect(ed.isDefault).toBe(true);
    expect(ed.baseItemCount).toBe(630);
    expect(ed.editionName?.en).toBe("Base Binder");
  });

  it("630 unique codes covering 1..630 contiguously", () => {
    const items = xl().sections.flatMap((s) => s.items);
    expect(items).toHaveLength(630);
    expect(new Set(items.map((i) => i.code)).size).toBe(630);
    const orders = items.map((i) => i.order).sort((a, b) => a - b);
    for (let i = 1; i <= 630; i++) expect(orders[i - 1]).toBe(i);
  });

  it("42 national-team sections, each 12 cards, FF/CREST/IC/9×HERO", () => {
    const teams = xl().sections.filter((s) => s.entityType === "NATIONAL_TEAM");
    expect(teams.length).toBe(42);
    for (const t of teams) {
      expect(t.items.length, t.id).toBe(12);
      const cats = t.items.map((i) => i.category);
      expect(cats[0]).toBe("FAN_FAVOURITE");
      expect(cats[1]).toBe("TEAM_CREST");
      expect(cats[2]).toBe("ICON");
      for (let i = 3; i < 12; i++) expect(cats[i]).toBe("HERO");
    }
  });

  it("no playerName on TEAM_CREST items", () => {
    const teams = xl().sections.filter((s) => s.entityType === "NATIONAL_TEAM");
    for (const t of teams) {
      const crest = t.items.find((i) => i.category === "TEAM_CREST");
      expect(crest, t.id).toBeDefined();
      expect(crest!.playerName).toBeUndefined();
    }
  });

  it("every team appears in alphabetical order at the expected start code", () => {
    for (const t of EXPECTED_TEAMS) {
      const section = xl().sections.find(
        (s) => s.entityType === "NATIONAL_TEAM" && s.title.en === t.nameEn
      );
      expect(section, t.nameEn).toBeDefined();
      expect(section!.items[0].code, t.nameEn).toBe(String(t.start));
      expect(section!.items[section!.items.length - 1].code, t.nameEn).toBe(String(t.start + 11));
    }
  });

  it("category ranges match the official PDF", () => {
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

  it("Golden Ballers names match the official 1–9 list", () => {
    const golden = xl().sections.find((s) => s.id === "golden-ballers")!;
    expect(golden.items.map((i) => i.playerName?.en)).toEqual([
      "Lionel Messi",
      "Vinícius Júnior",
      "Mohamed Salah",
      "Harry Kane",
      "Kylian Mbappé",
      "Son Heung-min",
      "Erling Haaland",
      "Cristiano Ronaldo",
      "Lamine Yamal",
    ]);
  });
});

describe("Tournament-group mapping (uses WC26 group draw)", () => {
  it("every Adrenalyn team that exists in the WC26 draw has a tournament group", () => {
    const teams = xl().sections.filter((s) => s.entityType === "NATIONAL_TEAM");
    // All 42 Adrenalyn teams are in the WC26 finalist list — every team must have a group.
    for (const t of teams) {
      expect(t.group, t.title.en ?? t.id).toBeDefined();
    }
  });

  it("Group A is Korea Republic / Mexico / South Africa (Adrenalyn order)", () => {
    const a = xl().sections.filter((s) => s.entityType === "NATIONAL_TEAM" && s.group === "A");
    const names = a.map((s) => s.title.en);
    // Adrenalyn includes only 3 of the 4 WC26 Group A teams (Czechia not in Adrenalyn).
    expect(names).toContain("Korea Republic");
    expect(names).toContain("Mexico");
    expect(names).toContain("South Africa");
  });

  it("all 12 groups (A–L) are represented", () => {
    const teams = xl().sections.filter((s) => s.entityType === "NATIONAL_TEAM");
    const groupsSeen = new Set(teams.map((t) => t.group));
    for (const letter of "ABCDEFGHIJKL".split("")) {
      expect(groupsSeen.has(letter), `group ${letter}`).toBe(true);
    }
  });
});

describe("Extras vs base completion isolation", () => {
  it("Momentum + Limited Editions live in specialCollections, not required", () => {
    const a = xl();
    expect(a.specialCollections?.length).toBe(2);
    const [momentum, limited] = a.specialCollections!;
    expect(momentum.id).toBe("momentum");
    expect(momentum.countsTowardAlbumCompletion).toBe(false);
    expect(momentum.items).toHaveLength(3);
    expect(limited.id).toBe("limited-editions");
    expect(limited.countsTowardAlbumCompletion).toBe(false);
    expect(limited.items).toHaveLength(0);
  });

  it("Momentum quantities never affect 630 base completion", () => {
    const a = xl();
    const qty: Record<string, number> = {};
    for (const it of a.specialCollections![0].items) qty[it.code] = 99;
    const p = albumProgressForQuantities(a, qty);
    expect(p.total).toBe(630);
    expect(p.unique).toBe(0);
  });

  it("100% base progress only with all 630 base codes ≥ 1", () => {
    const a = xl();
    const qty = Object.fromEntries(a.sections.flatMap((s) => s.items).map((i) => [i.code, 1]));
    const p = albumProgressForQuantities(a, qty);
    expect(p.percent).toBe(100);
    expect(p.unique).toBe(630);
  });

  it("missing list = 630 when nothing owned, includes codes 1 and 630", () => {
    const a = xl();
    const rows = listAlbumMissing(a, {});
    expect(rows).toHaveLength(630);
    const text = buildMissingTextForAlbum(a, {});
    expect(text).toContain("1");
    expect(text).toContain("630");
  });

  it("no fabricated codes 631–720", () => {
    const items = xl().sections.flatMap((s) => s.items);
    const numerics = items
      .map((i) => Number.parseInt(i.code, 10))
      .filter((n) => Number.isFinite(n));
    expect(Math.max(...numerics)).toBe(630);
    for (const n of numerics) expect(n).toBeLessThanOrEqual(630);
  });

  it("no missing card 80", () => {
    const items = xl().sections.flatMap((s) => s.items);
    expect(items.find((i) => i.code === "80")).toBeDefined();
  });
});

describe("Data quality (no corrupted strings)", () => {
  it("every item name has a non-empty English value", () => {
    const items = xl().sections.flatMap((s) => s.items);
    for (const it of items) {
      expect(it.name?.en && it.name.en.length > 0, it.code).toBe(true);
    }
  });

  it("no item title carries a redundant category suffix (FF / IC / Crest)", () => {
    const items = xl().sections.flatMap((s) => s.items);
    for (const it of items) {
      const player = it.playerName?.en ?? "";
      expect(/\sFF$/.test(player), it.code).toBe(false);
      expect(/\sIC$/.test(player), it.code).toBe(false);
    }
  });
});

describe("Sticker regressions stay green", () => {
  it("WC26 sticker album still verified-complete at 980", () => {
    const wc26 = getAlbumBySlug("world-cup-2026")!;
    expect(wc26.dataStatus).toBe("verified-complete");
    expect(wc26.totalItems).toBe(980);
    expect(wc26.itemType).toBe("STICKER");
  });

  it("WC22 sticker album still 670 / world-cup-flat-grouped", () => {
    const wc22 = getAlbumBySlug("world-cup-2022")!;
    expect(wc22.layout).toBe("world-cup-flat-grouped");
    expect(wc22.totalItems).toBe(670);
  });
});
