import { describe, it, expect } from "vitest";
import type { Album } from "@/collections/schema";
import {
  albumProgressForQuantities,
  buildDuplicatesCsvForAlbum,
  buildMissingTextForAlbum,
  listAlbumDuplicates,
  listAlbumMissing,
} from "@/lib/album/album-progress";

function makeAlbum(overrides: Partial<Album> = {}): Album {
  return {
    id: "test-album",
    slug: "test-album",
    familyId: "fam",
    title: { en: "Test" },
    itemType: "STICKER",
    dataStatus: "verified-partial",
    layout: "flat-sections",
    theme: { primary: "#000" },
    sections: [
      {
        id: "s1",
        title: { en: "Sec1" },
        order: 1,
        entityType: "OTHER",
        items: [
          {
            id: "i1",
            albumId: "test-album",
            sectionId: "s1",
            code: "S1-01",
            order: 1,
            isRequiredForCompletion: true,
          },
          {
            id: "i2",
            albumId: "test-album",
            sectionId: "s1",
            code: "S1-02",
            order: 2,
            isRequiredForCompletion: true,
          },
          {
            id: "i3",
            albumId: "test-album",
            sectionId: "s1",
            code: "S1-03",
            order: 3,
            isRequiredForCompletion: false,
          },
        ],
      },
    ],
    specialCollections: [],
    ...overrides,
  };
}

describe("albumProgressForQuantities — partial album", () => {
  it("tracks only required items", () => {
    const album = makeAlbum();
    const p = albumProgressForQuantities(album, { "S1-01": 1, "S1-03": 5 });
    expect(p.total).toBe(2);
    expect(p.unique).toBe(1);
    expect(p.missing).toBe(1);
    expect(p.percent).toBe(50);
  });

  it("counts extras as duplicates", () => {
    const album = makeAlbum();
    const p = albumProgressForQuantities(album, { "S1-01": 3, "S1-02": 1 });
    expect(p.duplicates).toBe(2);
    expect(p.unique).toBe(2);
  });

  it("zero state", () => {
    const album = makeAlbum();
    const p = albumProgressForQuantities(album, {});
    expect(p.unique).toBe(0);
    expect(p.missing).toBe(2);
    expect(p.percent).toBe(0);
  });

  it("metadata-only flag propagates", () => {
    const album = makeAlbum({ dataStatus: "metadata-only", sections: [] });
    const p = albumProgressForQuantities(album, {});
    expect(p.isMetadataOnly).toBe(true);
    expect(p.total).toBe(0);
  });
});

describe("listAlbumMissing / listAlbumDuplicates", () => {
  it("missing only lists required items at qty 0", () => {
    const album = makeAlbum();
    const rows = listAlbumMissing(album, { "S1-01": 1 });
    expect(rows.map((r) => r.item.code)).toEqual(["S1-02"]);
  });

  it("duplicates list contains extras only", () => {
    const album = makeAlbum();
    const rows = listAlbumDuplicates(album, { "S1-01": 3, "S1-02": 1 });
    expect(rows).toHaveLength(1);
    expect(rows[0].item.code).toBe("S1-01");
    expect(rows[0].extra).toBe(2);
  });

  it("builds plain-text missing list", () => {
    const album = makeAlbum();
    expect(buildMissingTextForAlbum(album, {})).toBe("S1-01\nS1-02");
  });

  it("builds duplicates csv", () => {
    const album = makeAlbum();
    expect(buildDuplicatesCsvForAlbum(album, { "S1-01": 3 })).toBe("code,duplicates\nS1-01,2");
  });
});

describe("special collection counting", () => {
  it("includes special collections marked countsTowardAlbumCompletion", () => {
    const album = makeAlbum({
      specialCollections: [
        {
          id: "sp1",
          title: { en: "Sp" },
          countsTowardAlbumCompletion: true,
          items: [
            {
              id: "x",
              albumId: "test-album",
              sectionId: "sp1",
              code: "X-1",
              order: 1,
              isRequiredForCompletion: true,
            },
          ],
        },
      ],
    });
    const p = albumProgressForQuantities(album, { "X-1": 1 });
    expect(p.total).toBe(3);
    expect(p.unique).toBe(1);
  });

  it("excludes special collections not counting toward completion", () => {
    const album = makeAlbum({
      specialCollections: [
        {
          id: "sp1",
          title: { en: "Sp" },
          countsTowardAlbumCompletion: false,
          items: [
            {
              id: "x",
              albumId: "test-album",
              sectionId: "sp1",
              code: "X-1",
              order: 1,
              isRequiredForCompletion: true,
            },
          ],
        },
      ],
    });
    const p = albumProgressForQuantities(album, { "X-1": 1 });
    expect(p.total).toBe(2);
  });
});
