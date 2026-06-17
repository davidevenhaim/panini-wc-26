import type { Album, CollectibleItem } from "@/collections/schema";
import { clampQuantity, type Quantities } from "./collection";

export type AlbumProgress = {
  total: number;
  unique: number;
  missing: number;
  duplicates: number;
  percent: number;
  isMetadataOnly: boolean;
};

/**
 * Generic per-album progress, computed from the album's own required items.
 * Works for any album shape — WC26, Football Stars, future Champions League.
 */
export function albumProgressForQuantities(album: Album, quantities: Quantities): AlbumProgress {
  const requiredCodes: string[] = [];
  for (const section of album.sections)
    for (const item of section.items) {
      if (item.isRequiredForCompletion) requiredCodes.push(item.code);
    }
  for (const special of album.specialCollections ?? [])
    if (special.countsTowardAlbumCompletion)
      for (const item of special.items) {
        if (item.isRequiredForCompletion) requiredCodes.push(item.code);
      }

  let unique = 0;
  let duplicates = 0;
  for (const code of requiredCodes) {
    const qty = clampQuantity(quantities[code] ?? 0);
    if (qty >= 1) unique += 1;
    if (qty >= 2) duplicates += qty - 1;
  }
  const total = requiredCodes.length || album.totalItems || 0;
  const missing = Math.max(0, total - unique);
  const percent = total === 0 ? 0 : Math.round((unique / total) * 100);
  return {
    total,
    unique,
    missing,
    duplicates,
    percent,
    isMetadataOnly: album.dataStatus === "metadata-only",
  };
}

export type AlbumItemRow = {
  item: CollectibleItem;
  sectionId: string;
  sectionTitleEn?: string;
  sectionTitleHe?: string;
  /** "section" | "specialCollection" */
  origin: "section" | "specialCollection";
};

/** Flat list of every required item in an album, paired with its section. */
export function listAlbumItemRows(album: Album): AlbumItemRow[] {
  const rows: AlbumItemRow[] = [];
  for (const section of album.sections) {
    for (const item of section.items) {
      rows.push({
        item,
        sectionId: section.id,
        sectionTitleEn: section.title.en,
        sectionTitleHe: section.title.he,
        origin: "section",
      });
    }
  }
  for (const special of album.specialCollections ?? []) {
    if (!special.countsTowardAlbumCompletion) continue;
    for (const item of special.items) {
      rows.push({
        item,
        sectionId: special.id,
        sectionTitleEn: special.title.en,
        sectionTitleHe: special.title.he,
        origin: "specialCollection",
      });
    }
  }
  return rows;
}

export type AlbumMissingResult = AlbumItemRow[];
export type AlbumDuplicateRow = AlbumItemRow & { quantity: number; extra: number };

export function listAlbumMissing(album: Album, quantities: Quantities): AlbumMissingResult {
  return listAlbumItemRows(album).filter(
    (row) => row.item.isRequiredForCompletion && clampQuantity(quantities[row.item.code] ?? 0) === 0
  );
}

export function listAlbumDuplicates(album: Album, quantities: Quantities): AlbumDuplicateRow[] {
  const out: AlbumDuplicateRow[] = [];
  for (const row of listAlbumItemRows(album)) {
    const qty = clampQuantity(quantities[row.item.code] ?? 0);
    if (qty >= 2) out.push({ ...row, quantity: qty, extra: qty - 1 });
  }
  return out;
}

export function buildMissingTextForAlbum(album: Album, quantities: Quantities): string {
  return listAlbumMissing(album, quantities)
    .map((r) => r.item.code)
    .join("\n");
}

export function buildDuplicatesCsvForAlbum(album: Album, quantities: Quantities): string {
  const lines: string[] = ["code,duplicates"];
  for (const row of listAlbumDuplicates(album, quantities)) {
    lines.push(`${row.item.code},${row.extra}`);
  }
  return lines.join("\n");
}
