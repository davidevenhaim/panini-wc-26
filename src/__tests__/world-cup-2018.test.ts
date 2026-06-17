import { describe, it, expect } from "vitest";
import { getAlbumBySlug, listRequiredCodes } from "@/collections/catalog";
import {
  albumProgressForQuantities,
  buildDuplicatesCsvForAlbum,
  buildMissingTextForAlbum,
  listAlbumMissing,
} from "@/lib/album/album-progress";

const wc18 = () => getAlbumBySlug("world-cup-2018")!;

describe("World Cup 2018 — activated dataset", () => {
  it("exists with the stable album id panini-world-cup-2018", () => {
    const a = wc18();
    expect(a).toBeDefined();
    expect(a.id).toBe("panini-world-cup-2018");
    expect(a.itemType).toBe("STICKER");
  });

  it("is verified-complete, world-cup-flat-grouped, totalItems 682", () => {
    const a = wc18();
    expect(a.dataStatus).toBe("verified-complete");
    expect(a.layout).toBe("world-cup-flat-grouped");
    expect(a.totalItems).toBe(682);
  });

  it("keeps the default INTERNATIONAL Standard Edition at baseItemCount 682", () => {
    const ed = wc18().editions![0];
    expect(ed.market).toBe("INTERNATIONAL");
    expect(ed.isDefault).toBe(true);
    expect(ed.baseItemCount).toBe(682);
    expect(ed.editionName?.en).toBe("Standard Edition");
  });

  it("contains 35 sections totalling 682 items", () => {
    const a = wc18();
    expect(a.sections.length).toBe(35);
    const sum = a.sections.reduce((acc, s) => acc + s.items.length, 0);
    expect(sum).toBe(682);
  });

  it("has 682 unique codes covering 0..681 contiguously", () => {
    const items = wc18().sections.flatMap((s) => s.items);
    expect(items).toHaveLength(682);
    expect(new Set(items.map((i) => i.code)).size).toBe(682);
    const codes = new Set(items.map((i) => i.code));
    for (let n = 0; n <= 681; n++) expect(codes.has(String(n)), `code ${n}`).toBe(true);
  });

  it("first item code is 0 and last is 681", () => {
    const items = wc18()
      .sections.flatMap((s) => s.items)
      .sort((a, b) => a.order - b.order);
    expect(items[0].code).toBe("0");
    expect(items[items.length - 1].code).toBe("681");
  });

  it("has 32 national-team sections, each exactly 20 items", () => {
    const teams = wc18().sections.filter((s) => s.entityType === "NATIONAL_TEAM");
    expect(teams.length).toBe(32);
    for (const s of teams) expect(s.items.length, s.id).toBe(20);
  });

  it("attaches groups A–H with exactly 4 teams each", () => {
    const teams = wc18().sections.filter((s) => s.entityType === "NATIONAL_TEAM");
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

  it("group A is Russia/Saudi Arabia/Egypt/Uruguay (album-order draw)", () => {
    const groupA = wc18()
      .sections.filter((s) => s.entityType === "NATIONAL_TEAM" && s.group === "A")
      .map((s) => s.badge);
    expect(groupA).toEqual(["RUS", "KSA", "EGY", "URU"]);
  });

  it("required-code list has 682 entries", () => {
    expect(listRequiredCodes(wc18())).toHaveLength(682);
  });

  it("known players survive intact (Messi / Ronaldo)", () => {
    const items = wc18().sections.flatMap((s) => s.items);
    expect(items.find((i) => i.playerName?.en === "Lionel Messi")).toBeDefined();
    expect(items.find((i) => i.playerName?.en === "Cristiano Ronaldo")).toBeDefined();
  });

  it("missing list empty when full, 682 when empty", () => {
    const a = wc18();
    const full = Object.fromEntries(a.sections.flatMap((s) => s.items).map((i) => [i.code, 1]));
    expect(listAlbumMissing(a, full)).toHaveLength(0);
    expect(listAlbumMissing(a, {})).toHaveLength(682);
  });

  it("export helpers carry numeric codes", () => {
    const a = wc18();
    expect(buildMissingTextForAlbum(a, {})).toContain("0");
    const csv = buildDuplicatesCsvForAlbum(a, { "100": 3 });
    expect(csv).toContain("100,2");
  });

  it("progress hits 100% when every code has qty ≥ 1", () => {
    const a = wc18();
    const qty = Object.fromEntries(a.sections.flatMap((s) => s.items).map((i) => [i.code, 1]));
    const p = albumProgressForQuantities(a, qty);
    expect(p.total).toBe(682);
    expect(p.percent).toBe(100);
  });

  it("documents the excluded extras", () => {
    const joined = (wc18().sourceNotes ?? []).join("\n");
    expect(joined).toMatch(/Update Set/i);
    expect(joined).toMatch(/Coca-Cola|promotional/i);
  });

  it("WC26 still verified-complete at 980 (regression)", () => {
    const wc26 = getAlbumBySlug("world-cup-2026")!;
    expect(wc26.dataStatus).toBe("verified-complete");
    expect(wc26.totalItems).toBe(980);
  });
});
