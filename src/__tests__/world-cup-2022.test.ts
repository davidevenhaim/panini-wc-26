import { describe, it, expect } from "vitest";
import { getAlbumBySlug, listRequiredCodes } from "@/collections/catalog";
import {
  albumProgressForQuantities,
  buildDuplicatesCsvForAlbum,
  buildMissingTextForAlbum,
  listAlbumDuplicates,
  listAlbumMissing,
} from "@/lib/album/album-progress";

const wc22 = () => getAlbumBySlug("world-cup-2022")!;

describe("World Cup 2022 — activated dataset", () => {
  it("exists with the stable album id panini-world-cup-2022", () => {
    const a = wc22();
    expect(a).toBeDefined();
    expect(a.id).toBe("panini-world-cup-2022");
    expect(a.itemType).toBe("STICKER");
  });

  it("is verified-complete, world-cup-flat-grouped, totalItems 670", () => {
    const a = wc22();
    expect(a.dataStatus).toBe("verified-complete");
    expect(a.layout).toBe("world-cup-flat-grouped");
    expect(a.totalItems).toBe(670);
  });

  it("attaches groups A–H with exactly 4 teams each", () => {
    const a = wc22();
    const teams = a.sections.filter((s) => s.entityType === "NATIONAL_TEAM");
    const byGroup = teams.reduce<Record<string, number>>((acc, t) => {
      const g = t.group ?? "?";
      acc[g] = (acc[g] ?? 0) + 1;
      return acc;
    }, {});
    expect(Object.keys(byGroup).sort()).toEqual(["A", "B", "C", "D", "E", "F", "G", "H"]);
    for (const letter of ["A", "B", "C", "D", "E", "F", "G", "H"]) {
      expect(byGroup[letter], `group ${letter}`).toBe(4);
    }
  });

  it("groups follow album-order draw (Group A = Qatar/Ecuador/Senegal/Netherlands)", () => {
    const groupA = wc22()
      .sections.filter((s) => s.entityType === "NATIONAL_TEAM" && s.group === "A")
      .map((s) => s.badge);
    expect(groupA).toEqual(["QAT", "ECU", "SEN", "NED"]);
  });

  it("attaches flag + colors to each national team", () => {
    const teams = wc22().sections.filter((s) => s.entityType === "NATIONAL_TEAM");
    for (const t of teams) {
      expect(t.flag, t.id).toBeTruthy();
      expect(t.primaryColor, t.id).toBeTruthy();
      expect(t.accentColor, t.id).toBeTruthy();
    }
  });

  it("keeps the default INTERNATIONAL Standard Edition at baseItemCount 670", () => {
    const a = wc22();
    expect(a.editions).toBeDefined();
    expect(a.editions!.length).toBe(1);
    const ed = a.editions![0];
    expect(ed.market).toBe("INTERNATIONAL");
    expect(ed.isDefault).toBe(true);
    expect(ed.baseItemCount).toBe(670);
    expect(ed.editionName?.en).toBe("Standard Edition");
  });

  it("contains exactly 36 sections, each carrying its source items", () => {
    const a = wc22();
    expect(a.sections.length).toBe(36);
    const totals = a.sections.map((s) => s.items.length);
    const sum = totals.reduce((acc, n) => acc + n, 0);
    expect(sum).toBe(670);
  });

  it("contains exactly 670 items with unique codes and orders 1..670", () => {
    const items = wc22().sections.flatMap((s) => s.items);
    expect(items).toHaveLength(670);
    expect(new Set(items.map((i) => i.code)).size).toBe(670);
    const orders = items.map((i) => i.order).sort((a, b) => a - b);
    expect(orders[0]).toBe(1);
    expect(orders[orders.length - 1]).toBe(670);
    for (let i = 1; i <= 670; i++) expect(orders[i - 1]).toBe(i);
  });

  it("first item code is 00 and last is FWC29", () => {
    const items = wc22()
      .sections.flatMap((s) => s.items)
      .sort((a, b) => a.order - b.order);
    expect(items[0].code).toBe("00");
    expect(items[items.length - 1].code).toBe("FWC29");
  });

  it("has 32 national-team sections, each exactly 20 items", () => {
    const a = wc22();
    const teamSections = a.sections.filter((s) => s.entityType === "NATIONAL_TEAM");
    expect(teamSections.length).toBe(32);
    for (const s of teamSections) {
      expect(s.items.length, s.id).toBe(20);
    }
  });

  it("Qatar section spans QAT1..QAT20", () => {
    const qat = wc22().sections.find((s) => s.id === "qatar")!;
    expect(qat).toBeDefined();
    expect(qat.items[0].code).toBe("QAT1");
    expect(qat.items[qat.items.length - 1].code).toBe("QAT20");
  });

  it("FIFA Museum section contains FWC19..FWC29", () => {
    const museum = wc22().sections.find((s) => s.id === "fifa-museum")!;
    expect(museum).toBeDefined();
    const codes = museum.items.map((i) => i.code);
    for (let n = 19; n <= 29; n++) expect(codes).toContain(`FWC${n}`);
  });

  it("required-code list has 670 entries (all base items count toward completion)", () => {
    expect(listRequiredCodes(wc22())).toHaveLength(670);
  });

  it("representative items survive intact (first, first team, mid team, last team, museum)", () => {
    const items = wc22()
      .sections.flatMap((s) => s.items)
      .reduce<Record<string, (typeof wc22.prototype.sections)[number]["items"][number]>>(
        (acc, it) => ({ ...acc, [it.code]: it }),
        {}
      );
    expect(items["00"].name?.en).toBe("Panini");
    expect(items["QAT1"].teamName?.en).toBe("Qatar");
    expect(items["BRA1"].teamName?.en).toBe("Brazil");
    expect(items["KOR20"].teamName?.en).toBe("South Korea");
    expect(items["FWC29"].sectionId).toBe("fifa-museum");
  });

  it("named players keep their LastSticker spellings", () => {
    const items = wc22().sections.flatMap((s) => s.items);
    const messi = items.find((i) => i.playerName?.en === "Lionel Messi");
    expect(messi, "Messi present").toBeDefined();
    const ronaldo = items.find((i) => i.playerName?.en === "Cristiano Ronaldo");
    expect(ronaldo, "Ronaldo present").toBeDefined();
  });

  it("search finds player, country code and section-prefixed sticker code", () => {
    const items = wc22().sections.flatMap((s) => s.items);
    const byPlayer = items.filter((i) => i.playerName?.en?.toLowerCase().includes("messi"));
    expect(byPlayer.length).toBeGreaterThan(0);
    const byTeam = items.filter((i) => i.teamName?.en === "Argentina");
    expect(byTeam.length).toBe(20);
    const byCode = items.find((i) => i.code === "ARG20");
    expect(byCode).toBeDefined();
  });

  it("missing list is empty when album is complete and full when empty", () => {
    const a = wc22();
    const full = Object.fromEntries(a.sections.flatMap((s) => s.items).map((i) => [i.code, 1]));
    expect(listAlbumMissing(a, full)).toHaveLength(0);
    expect(listAlbumMissing(a, {})).toHaveLength(670);
  });

  it("missing text export carries the prefixed codes", () => {
    const text = buildMissingTextForAlbum(wc22(), {});
    expect(text).toContain("00");
    expect(text).toContain("FWC1");
    expect(text).toContain("QAT1");
    expect(text).toContain("FWC29");
  });

  it("duplicates export carries the prefixed codes", () => {
    const a = wc22();
    const csv = buildDuplicatesCsvForAlbum(a, { QAT1: 3, FWC29: 2 });
    expect(csv).toContain("QAT1,2");
    expect(csv).toContain("FWC29,1");
    const rows = listAlbumDuplicates(a, { QAT1: 3 });
    expect(rows).toHaveLength(1);
    expect(rows[0].item.code).toBe("QAT1");
    expect(rows[0].extra).toBe(2);
  });

  it("progress reaches 100% when every base code has qty ≥ 1", () => {
    const a = wc22();
    const qty = Object.fromEntries(a.sections.flatMap((s) => s.items).map((i) => [i.code, 1]));
    const p = albumProgressForQuantities(a, qty);
    expect(p.total).toBe(670);
    expect(p.unique).toBe(670);
    expect(p.percent).toBe(100);
  });

  it("WC26 stays untouched (regression)", () => {
    const wc26 = getAlbumBySlug("world-cup-2026")!;
    expect(wc26.dataStatus).toBe("verified-complete");
    expect(wc26.totalItems).toBe(980);
    expect(wc26.id).toBe("panini-world-cup-2026");
  });

  it("source notes call out the reconciliation, not an official Panini source", () => {
    const a = wc22();
    expect(a.sourceNotes?.some((n) => /community-maintained|reconciled/i.test(n))).toBe(true);
  });

  it("documents the excluded extras so they cannot drift into completion", () => {
    const a = wc22();
    const joined = (a.sourceNotes ?? []).join("\n");
    expect(joined).toMatch(/Base Update Set/);
    expect(joined).toMatch(/Coca-Cola/);
    expect(joined).toMatch(/DFB Germany/);
    expect(joined).toMatch(/Legends & Rookies/);
    expect(joined).toMatch(/parallel/i);
  });
});
