import { describe, it, expect } from "vitest";
import { getAlbumBySlug, listRequiredCodes } from "@/collections/catalog";
import {
  albumProgressForQuantities,
  buildDuplicatesCsvForAlbum,
  buildMissingTextForAlbum,
  listAlbumDuplicates,
  listAlbumMissing,
} from "@/lib/album/album-progress";

const wc14 = () => getAlbumBySlug("world-cup-2014")!;

describe("World Cup 2014 — activated dataset", () => {
  it("exists with the stable album id panini-world-cup-2014", () => {
    const a = wc14();
    expect(a).toBeDefined();
    expect(a.id).toBe("panini-world-cup-2014");
    expect(a.itemType).toBe("STICKER");
  });

  it("is verified-complete, world-cup-flat-grouped, totalItems 640", () => {
    const a = wc14();
    expect(a.dataStatus).toBe("verified-complete");
    expect(a.layout).toBe("world-cup-flat-grouped");
    expect(a.totalItems).toBe(640);
  });

  it("keeps the default INTERNATIONAL Standard Edition at baseItemCount 640", () => {
    const ed = wc14().editions![0];
    expect(ed.market).toBe("INTERNATIONAL");
    expect(ed.isDefault).toBe(true);
    expect(ed.baseItemCount).toBe(640);
    expect(ed.editionName?.en).toBe("Standard Edition");
  });

  it("contains exactly 34 sections totalling 640 items", () => {
    const a = wc14();
    expect(a.sections.length).toBe(34);
    const sum = a.sections.reduce((acc, s) => acc + s.items.length, 0);
    expect(sum).toBe(640);
  });

  it("has 640 unique codes and orders 1..640 with no gaps", () => {
    const items = wc14().sections.flatMap((s) => s.items);
    expect(items).toHaveLength(640);
    expect(new Set(items.map((i) => i.code)).size).toBe(640);
    const orders = items.map((i) => i.order).sort((a, b) => a - b);
    expect(orders[0]).toBe(1);
    expect(orders[orders.length - 1]).toBe(640);
    for (let i = 1; i <= 640; i++) expect(orders[i - 1]).toBe(i);
  });

  it("first item code is 1 and last is 640", () => {
    const items = wc14()
      .sections.flatMap((s) => s.items)
      .sort((a, b) => a.order - b.order);
    expect(items[0].code).toBe("1");
    expect(items[items.length - 1].code).toBe("640");
  });

  it("has 32 national-team sections, each exactly 19 items", () => {
    const teams = wc14().sections.filter((s) => s.entityType === "NATIONAL_TEAM");
    expect(teams.length).toBe(32);
    for (const s of teams) expect(s.items.length, s.id).toBe(19);
  });

  it("attaches groups A–H with exactly 4 teams each", () => {
    const teams = wc14().sections.filter((s) => s.entityType === "NATIONAL_TEAM");
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

  it("group A is Brazil/Croatia/Mexico/Cameroon (album-order draw)", () => {
    const groupA = wc14()
      .sections.filter((s) => s.entityType === "NATIONAL_TEAM" && s.group === "A")
      .map((s) => s.badge);
    expect(groupA).toEqual(["BRA", "CRO", "MEX", "CMR"]);
  });

  it("required-code list has 640 entries", () => {
    expect(listRequiredCodes(wc14())).toHaveLength(640);
  });

  it("named players keep their LastSticker spellings", () => {
    const items = wc14().sections.flatMap((s) => s.items);
    const messi = items.find((i) => i.playerName?.en === "Lionel Messi");
    expect(messi, "Messi present").toBeDefined();
    const neymar = items.find((i) => i.playerName?.en?.startsWith("Neymar"));
    expect(neymar, "Neymar present").toBeDefined();
  });

  it("missing list empty when full, 640 when empty", () => {
    const a = wc14();
    const full = Object.fromEntries(a.sections.flatMap((s) => s.items).map((i) => [i.code, 1]));
    expect(listAlbumMissing(a, full)).toHaveLength(0);
    expect(listAlbumMissing(a, {})).toHaveLength(640);
  });

  it("export helpers carry numeric codes", () => {
    const a = wc14();
    expect(buildMissingTextForAlbum(a, {})).toContain("1");
    const csv = buildDuplicatesCsvForAlbum(a, { "33": 3 });
    expect(csv).toContain("33,2");
    const rows = listAlbumDuplicates(a, { "33": 3 });
    expect(rows).toHaveLength(1);
    expect(rows[0].extra).toBe(2);
  });

  it("progress hits 100% when every base code has qty ≥ 1", () => {
    const a = wc14();
    const qty = Object.fromEntries(a.sections.flatMap((s) => s.items).map((i) => [i.code, 1]));
    const p = albumProgressForQuantities(a, qty);
    expect(p.total).toBe(640);
    expect(p.percent).toBe(100);
  });

  it("documents the excluded extras", () => {
    const joined = (wc14().sourceNotes ?? []).join("\n");
    expect(joined).toMatch(/Update Set/i);
    expect(joined).toMatch(/Coca-Cola|promotional/i);
  });

  it("WC26 still verified-complete at 980 (regression)", () => {
    const wc26 = getAlbumBySlug("world-cup-2026")!;
    expect(wc26.dataStatus).toBe("verified-complete");
    expect(wc26.totalItems).toBe(980);
  });
});
