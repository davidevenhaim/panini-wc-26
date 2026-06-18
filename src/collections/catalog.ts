import type { Album, CollectionFamily } from "./schema";
import { validateAlbum } from "./schema";
import { WORLD_CUP_FAMILY } from "@/data/world-cup/family";
import { WORLD_CUP_ADRENALYN_FAMILY } from "@/data/world-cup/adrenalyn-family";
import { WORLD_CUP_2026_ALBUM } from "@/data/world-cup/2026";
import { WORLD_CUP_2006_ALBUM } from "@/data/world-cup/2006/album";
import { WORLD_CUP_2010_ALBUM } from "@/data/world-cup/2010/album";
import { WORLD_CUP_2014_ALBUM } from "@/data/world-cup/2014/album";
import { WORLD_CUP_2018_ALBUM } from "@/data/world-cup/2018/album";
import { WORLD_CUP_2022_ALBUM } from "@/data/world-cup/2022/album";
import { WORLD_CUP_2010_ADRENALYN_ALBUM } from "@/data/world-cup/2010-adrenalyn-xl/album";
import { WORLD_CUP_2026_ADRENALYN_ALBUM } from "@/data/world-cup/2026-adrenalyn-xl/album";
import { ISRAEL_FAMILY } from "@/data/israel/family";
import { ISRAEL_ALBUMS } from "@/data/israel/albums";

/* ── Family registry ──────────────────────────────────────────────────────── */

export const COLLECTION_FAMILIES: CollectionFamily[] = [
  WORLD_CUP_FAMILY,
  WORLD_CUP_ADRENALYN_FAMILY,
  ISRAEL_FAMILY,
];

export const FAMILY_BY_ID: Record<string, CollectionFamily> = Object.fromEntries(
  COLLECTION_FAMILIES.map((f) => [f.id, f])
);
export const FAMILY_BY_SLUG: Record<string, CollectionFamily> = Object.fromEntries(
  COLLECTION_FAMILIES.map((f) => [f.slug, f])
);

/* ── Album registry ───────────────────────────────────────────────────────── */

/** Raw input list. Order here defines display order on the family page. */
const RAW_ALBUMS: Album[] = [
  WORLD_CUP_2026_ALBUM,
  WORLD_CUP_2022_ALBUM,
  WORLD_CUP_2018_ALBUM,
  WORLD_CUP_2014_ALBUM,
  WORLD_CUP_2010_ALBUM,
  WORLD_CUP_2006_ALBUM,
  WORLD_CUP_2026_ADRENALYN_ALBUM,
  WORLD_CUP_2010_ADRENALYN_ALBUM,
  ...ISRAEL_ALBUMS,
];

export type AlbumLoadReport = {
  loaded: Album[];
  failed: { albumId?: string; error: string }[];
};

function loadAndValidate(): AlbumLoadReport {
  const loaded: Album[] = [];
  const failed: AlbumLoadReport["failed"] = [];
  for (const raw of RAW_ALBUMS) {
    const result = validateAlbum(raw);
    if (result.ok) loaded.push(result.album);
    else {
      failed.push({ albumId: result.albumId, error: result.error });
      if (process.env.NODE_ENV !== "production") {
        console.error(
          `[catalog] album ${result.albumId ?? "(unknown)"} failed validation:`,
          result.error
        );
      }
    }
  }
  return { loaded, failed };
}

const REPORT = loadAndValidate();

/** All validated albums. Invalid albums are dropped so they cannot crash the app. */
export const ALBUMS: Album[] = REPORT.loaded;
export const ALBUM_LOAD_FAILURES = REPORT.failed;

export const ALBUM_BY_ID: Record<string, Album> = Object.fromEntries(ALBUMS.map((a) => [a.id, a]));
export const ALBUM_BY_SLUG: Record<string, Album> = Object.fromEntries(
  ALBUMS.map((a) => [a.slug, a])
);

/* ── Lookups ──────────────────────────────────────────────────────────────── */

export function getAlbumBySlug(slug: string): Album | undefined {
  return ALBUM_BY_SLUG[slug];
}
export function getAlbumById(id: string): Album | undefined {
  return ALBUM_BY_ID[id];
}
export function getFamilyBySlug(slug: string): CollectionFamily | undefined {
  return FAMILY_BY_SLUG[slug];
}
export function getFamilyAlbums(familyId: string): Album[] {
  return ALBUMS.filter((a) => a.familyId === familyId);
}

/* ── Convenience selectors used by routes ─────────────────────────────────── */

export const ISRAEL_ALBUMS_SORTED_DESC: Album[] = ALBUMS.filter((a) => a.country === "ISRAEL").sort(
  (a, b) => (b.year ?? 0) - (a.year ?? 0)
);

export const ISRAEL_ALBUMS_SORTED_ASC: Album[] = [...ISRAEL_ALBUMS_SORTED_DESC].reverse();

export const WORLD_CUP_ALBUMS_SORTED_DESC: Album[] = ALBUMS.filter(
  (a) => a.familyId === "panini-world-cup"
).sort((a, b) => (b.year ?? 0) - (a.year ?? 0));
export const WORLD_CUP_ALBUMS_SORTED_ASC: Album[] = [...WORLD_CUP_ALBUMS_SORTED_DESC].reverse();

export const ADRENALYN_ALBUMS_SORTED_DESC: Album[] = ALBUMS.filter(
  (a) => a.familyId === "world-cup-adrenalyn-xl"
).sort((a, b) => (b.year ?? 0) - (a.year ?? 0));
export const ADRENALYN_ALBUMS_SORTED_ASC: Album[] = [...ADRENALYN_ALBUMS_SORTED_DESC].reverse();

/* ── Item index for storage migration / sync ──────────────────────────────── */

/** Build a flat list of every collectible code across all loaded albums. */
export function listAlbumItemCodes(album: Album): string[] {
  const codes: string[] = [];
  for (const section of album.sections) for (const item of section.items) codes.push(item.code);
  for (const special of album.specialCollections ?? [])
    for (const item of special.items) codes.push(item.code);
  return codes;
}

/** Required (counts-toward-completion) codes for an album. */
export function listRequiredCodes(album: Album): string[] {
  const codes: string[] = [];
  for (const section of album.sections)
    for (const item of section.items) {
      if (item.isRequiredForCompletion) codes.push(item.code);
    }
  for (const special of album.specialCollections ?? [])
    if (special.countsTowardAlbumCompletion)
      for (const item of special.items) {
        if (item.isRequiredForCompletion) codes.push(item.code);
      }
  return codes;
}
