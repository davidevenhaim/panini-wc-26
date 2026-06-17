import { describe, it, expect } from "vitest";
import {
  ADRENALYN_ALBUMS_SORTED_ASC,
  ADRENALYN_ALBUMS_SORTED_DESC,
  COLLECTION_FAMILIES,
  WORLD_CUP_ALBUMS_SORTED_DESC,
  getAlbumBySlug,
  getFamilyBySlug,
} from "@/collections/catalog";

describe("Adrenalyn family + 2010 skeleton", () => {
  it("registers the world-cup-adrenalyn-xl family", () => {
    const family = getFamilyBySlug("world-cup-adrenalyn-xl");
    expect(family).toBeDefined();
    expect(family!.publisher).toBe("Panini");
    expect(family!.name.en).toContain("Adrenalyn");
  });

  it("does not lose the existing sticker family", () => {
    const ids = COLLECTION_FAMILIES.map((f) => f.id);
    expect(ids).toContain("panini-world-cup");
    expect(ids).toContain("world-cup-adrenalyn-xl");
    expect(ids).toContain("israeli-football-albums");
  });

  it("exposes the 2010 Adrenalyn album as CARD itemType, metadata-only", () => {
    const album = getAlbumBySlug("world-cup-2010-adrenalyn-xl");
    expect(album).toBeDefined();
    expect(album!.itemType).toBe("CARD");
    expect(album!.dataStatus).toBe("metadata-only");
    expect(album!.familyId).toBe("world-cup-adrenalyn-xl");
    expect(album!.editions).toBeDefined();
    expect(album!.editions!.length).toBe(1);
    expect(album!.editions![0].market).toBe("INTERNATIONAL");
    expect(album!.editions![0].isDefault).toBe(true);
    expect(album!.editions![0].baseItemCount).toBe(350);
  });

  it("keeps sticker and Adrenalyn album lists isolated", () => {
    const stickerIds = new Set(WORLD_CUP_ALBUMS_SORTED_DESC.map((a) => a.id));
    const adrenalynIds = new Set(ADRENALYN_ALBUMS_SORTED_DESC.map((a) => a.id));
    expect(stickerIds.has("panini-world-cup-2010-adrenalyn-xl")).toBe(false);
    expect(adrenalynIds.has("panini-world-cup-2010")).toBe(false);
    expect(adrenalynIds.has("panini-world-cup-2010-adrenalyn-xl")).toBe(true);
  });

  it("sticker side keeps existing 2022 expectation at 670 base items", () => {
    const wc22 = getAlbumBySlug("world-cup-2022")!;
    expect(wc22.editions![0].baseItemCount).toBe(670);
  });

  it("Adrenalyn sorted-asc is the inverse of sorted-desc", () => {
    expect(ADRENALYN_ALBUMS_SORTED_ASC.map((a) => a.slug)).toEqual(
      [...ADRENALYN_ALBUMS_SORTED_DESC].reverse().map((a) => a.slug)
    );
  });

  it("if 2022 stickers ever upgrade to verified data, total must equal 670", () => {
    const wc22 = getAlbumBySlug("world-cup-2022")!;
    if (wc22.dataStatus === "verified-complete") {
      const total = wc22.sections.reduce((acc, s) => acc + s.items.length, 0);
      expect(total).toBe(670);
      const codes = wc22.sections.flatMap((s) => s.items.map((i) => i.code));
      expect(new Set(codes).size).toBe(codes.length);
    }
  });

  it("if 2010 Adrenalyn ever upgrades to verified data, total must equal 350", () => {
    const a = getAlbumBySlug("world-cup-2010-adrenalyn-xl")!;
    if (a.dataStatus === "verified-complete") {
      const total = a.sections.reduce((acc, s) => acc + s.items.length, 0);
      expect(total).toBe(350);
      const codes = a.sections.flatMap((s) => s.items.map((i) => i.code));
      expect(new Set(codes).size).toBe(codes.length);
      const numericPart = (c: string) => {
        const m = c.match(/\d+/);
        return m ? Number.parseInt(m[0], 10) : NaN;
      };
      const numerics = codes.map(numericPart).filter((n) => Number.isFinite(n));
      expect(Math.min(...numerics)).toBeGreaterThan(0);
      expect(Math.max(...numerics)).toBe(350);
    }
  });
});
