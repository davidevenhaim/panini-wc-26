import { describe, it, expect } from "vitest";
import {
  ALBUM_LOAD_FAILURES,
  WORLD_CUP_ALBUMS_SORTED_DESC,
  WORLD_CUP_ALBUMS_SORTED_ASC,
  getAlbumBySlug,
} from "@/collections/catalog";
import { validateAlbum } from "@/collections/schema";

describe("World Cup catalog", () => {
  it("loads every World Cup album without validation errors", () => {
    const failures = ALBUM_LOAD_FAILURES.filter((f) => f.albumId?.startsWith("panini-world-cup-"));
    expect(failures).toEqual([]);
  });

  it("contains 2006, 2010, 2014, 2018, 2022 and 2026", () => {
    const slugs = WORLD_CUP_ALBUMS_SORTED_DESC.map((a) => a.slug);
    expect(slugs).toEqual([
      "world-cup-2026",
      "world-cup-2022",
      "world-cup-2018",
      "world-cup-2014",
      "world-cup-2010",
      "world-cup-2006",
    ]);
  });

  it("sorted-asc is the inverse of sorted-desc", () => {
    expect(WORLD_CUP_ALBUMS_SORTED_ASC.map((a) => a.slug)).toEqual([
      "world-cup-2006",
      "world-cup-2010",
      "world-cup-2014",
      "world-cup-2018",
      "world-cup-2022",
      "world-cup-2026",
    ]);
  });

  it("every historical World Cup album declares a default INTERNATIONAL edition with positive baseItemCount", () => {
    for (const slug of [
      "world-cup-2006",
      "world-cup-2010",
      "world-cup-2014",
      "world-cup-2018",
      "world-cup-2022",
    ]) {
      const a = getAlbumBySlug(slug);
      expect(a, slug).toBeDefined();
      expect(a!.editions).toBeDefined();
      expect(a!.editions!.length).toBe(1);
      expect(a!.editions![0].market).toBe("INTERNATIONAL");
      expect(a!.editions![0].isDefault).toBe(true);
      expect(a!.editions![0].baseItemCount).toBeGreaterThan(0);
    }
  });

  it("each WC edition's baseItemCount matches public expectations", () => {
    const expected: Record<string, number> = {
      "world-cup-2006": 597,
      "world-cup-2010": 641,
      "world-cup-2014": 640,
      "world-cup-2018": 682,
      "world-cup-2022": 670,
    };
    for (const [slug, count] of Object.entries(expected)) {
      const a = getAlbumBySlug(slug)!;
      expect(a.editions![0].baseItemCount, slug).toBe(count);
    }
  });

  it("WC26 stays verified-complete and untouched at 980", () => {
    const a = getAlbumBySlug("world-cup-2026")!;
    expect(a.dataStatus).toBe("verified-complete");
    expect(a.totalItems).toBe(980);
  });

  it("validator rejects an album with two default editions", () => {
    const a = getAlbumBySlug("world-cup-2010")!;
    const bad = validateAlbum({
      ...a,
      editions: [...a.editions!, { ...a.editions![0], id: `${a.id}::dupe`, isDefault: true }],
    });
    expect(bad.ok).toBe(false);
  });

  it("validator rejects edition with mismatched albumId", () => {
    const a = getAlbumBySlug("world-cup-2010")!;
    const bad = validateAlbum({
      ...a,
      editions: [{ ...a.editions![0], albumId: "wrong" }],
    });
    expect(bad.ok).toBe(false);
  });
});
