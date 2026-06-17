import { describe, it, expect } from "vitest";
import {
  ALBUMS,
  ALBUM_BY_SLUG,
  ALBUM_LOAD_FAILURES,
  COLLECTION_FAMILIES,
  ISRAEL_ALBUMS_SORTED_DESC,
  getAlbumBySlug,
  getFamilyAlbums,
  getFamilyBySlug,
  listAlbumItemCodes,
  listRequiredCodes,
} from "@/collections/catalog";

describe("catalog", () => {
  it("loads at least one family + the WC26 album", () => {
    expect(ALBUM_LOAD_FAILURES).toEqual([]);
    expect(COLLECTION_FAMILIES.length).toBeGreaterThan(0);
    const wc = getAlbumBySlug("world-cup-2026");
    expect(wc).toBeDefined();
    expect(wc?.dataStatus).toBe("verified-complete");
    expect(wc?.totalItems).toBe(980);
  });

  it("exposes lookups by id and slug", () => {
    expect(ALBUM_BY_SLUG["world-cup-2026"]).toBeDefined();
    expect(getFamilyBySlug("world-cup")).toBeDefined();
    expect(getFamilyBySlug("israel")).toBeDefined();
  });

  it("counts required codes for WC26 = 980", () => {
    const wc = getAlbumBySlug("world-cup-2026")!;
    expect(listRequiredCodes(wc)).toHaveLength(980);
    // Bonus collection adds 12 more total items but they are not required.
    expect(listAlbumItemCodes(wc)).toHaveLength(992);
  });

  it("groups Israeli albums together, sorted newest-first", () => {
    expect(ISRAEL_ALBUMS_SORTED_DESC.length).toBeGreaterThan(0);
    const years = ISRAEL_ALBUMS_SORTED_DESC.map((a) => a.year ?? 0);
    const sortedCopy = [...years].sort((a, b) => b - a);
    expect(years).toEqual(sortedCopy);
  });

  it("marks every Israeli album as metadata-only (no invented checklists)", () => {
    const israelFamily = getFamilyBySlug("israel")!;
    const israelAlbums = getFamilyAlbums(israelFamily.id);
    expect(israelAlbums.length).toBeGreaterThan(0);
    for (const a of israelAlbums) {
      expect(a.dataStatus).toBe("metadata-only");
      expect(a.sections).toEqual([]);
      expect(a.specialCollections).toEqual([]);
    }
  });

  it("every loaded album has a unique slug", () => {
    const slugs = ALBUMS.map((a) => a.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("rejects albums with duplicate codes", async () => {
    const { validateAlbum } = await import("@/collections/schema");
    const bad = validateAlbum({
      id: "x",
      slug: "x",
      familyId: "y",
      title: { en: "X" },
      itemType: "STICKER",
      dataStatus: "verified-complete",
      layout: "flat-sections",
      theme: { primary: "#fff" },
      sections: [
        {
          id: "s1",
          title: { en: "S1" },
          order: 0,
          entityType: "OTHER",
          items: [
            {
              id: "a",
              albumId: "x",
              sectionId: "s1",
              code: "DUP1",
              order: 0,
              isRequiredForCompletion: true,
            },
            {
              id: "b",
              albumId: "x",
              sectionId: "s1",
              code: "DUP1",
              order: 1,
              isRequiredForCompletion: true,
            },
          ],
        },
      ],
    });
    expect(bad.ok).toBe(false);
  });
});
