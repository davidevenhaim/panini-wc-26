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

export type AlbumGroupedBucket = {
  id: string;
  title: string;
  codes: string[];
  counts?: Record<string, number>;
};

/** Localized section label, including badge/flag when present. */
export function resolveAlbumSectionLabel(
  album: Album,
  sectionId: string,
  label: (text: { en?: string; he?: string }) => string
): string {
  const section =
    album.sections.find((s) => s.id === sectionId) ??
    album.specialCollections?.find((s) => s.id === sectionId);
  if (!section) return sectionId;
  const name = label(section.title);
  const badge = "badge" in section ? section.badge : undefined;
  return badge ? `${badge} ${name}`.trim() : name;
}

function sectionTitleForRow(
  album: Album,
  row: AlbumItemRow,
  label: (text: { en?: string; he?: string }) => string
): string {
  return resolveAlbumSectionLabel(album, row.sectionId, label);
}

/** Groups missing required items by album section (any album shape). */
export function groupAlbumMissingBySection(
  album: Album,
  quantities: Quantities,
  label: (text: { en?: string; he?: string }) => string
): AlbumGroupedBucket[] {
  const buckets = new Map<string, AlbumGroupedBucket>();
  for (const row of listAlbumItemRows(album)) {
    if (!row.item.isRequiredForCompletion) continue;
    if (clampQuantity(quantities[row.item.code] ?? 0) !== 0) continue;
    const title = sectionTitleForRow(album, row, label);
    const existing = buckets.get(row.sectionId);
    if (existing) existing.codes.push(row.item.code);
    else buckets.set(row.sectionId, { id: row.sectionId, title, codes: [row.item.code] });
  }
  return [...buckets.values()];
}

/** Groups duplicate required items by album section with per-code extra counts. */
export function groupAlbumDuplicatesBySection(
  album: Album,
  quantities: Quantities,
  label: (text: { en?: string; he?: string }) => string
): AlbumGroupedBucket[] {
  const buckets = new Map<string, AlbumGroupedBucket>();
  for (const row of listAlbumItemRows(album)) {
    if (!row.item.isRequiredForCompletion) continue;
    const qty = clampQuantity(quantities[row.item.code] ?? 0);
    if (qty < 2) continue;
    const title = sectionTitleForRow(album, row, label);
    const existing = buckets.get(row.sectionId);
    if (existing) {
      existing.codes.push(row.item.code);
      existing.counts![row.item.code] = qty - 1;
    } else {
      buckets.set(row.sectionId, {
        id: row.sectionId,
        title,
        codes: [row.item.code],
        counts: { [row.item.code]: qty - 1 },
      });
    }
  }
  return [...buckets.values()];
}

/** Album codes the viewer still needs (required items only). */
export function viewerMissingSetForAlbum(album: Album, quantities: Quantities): Set<string> {
  const result = new Set<string>();
  for (const row of listAlbumItemRows(album)) {
    if (!row.item.isRequiredForCompletion) continue;
    if (clampQuantity(quantities[row.item.code] ?? 0) === 0) result.add(row.item.code);
  }
  return result;
}

/** Codes the owner has as duplicates that the viewer is missing, in album order. */
export function computeSwapMatchesForAlbum(
  album: Album,
  ownerQuantities: Quantities,
  viewerQuantities: Quantities
): string[] {
  const myMissing = viewerMissingSetForAlbum(album, viewerQuantities);
  const matches: string[] = [];
  for (const row of listAlbumItemRows(album)) {
    if (!row.item.isRequiredForCompletion) continue;
    const ownerQty = clampQuantity(ownerQuantities[row.item.code] ?? 0);
    if (ownerQty >= 2 && myMissing.has(row.item.code)) matches.push(row.item.code);
  }
  return matches;
}
