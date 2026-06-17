import type { SupabaseClient } from "@supabase/supabase-js";
import type { Profile } from "@/types/profile.types";
import { ALBUM_STICKERS } from "@/constants/album";
import { DEFAULT_SYNC_ALBUM_ID } from "./supabase-sync";
import { clampQuantity, computeAlbumStats, type Quantities } from "./collection";

export type PublicProfileSummary = {
  profile: Profile;
  /** WC26 album stats — total, unique, missing, duplicates, percent. */
  album: ReturnType<typeof computeAlbumStats>;
  /** Number of distinct album_ids where the user owns at least one sticker. */
  albumsCount: number;
  /** Codes with qty >= 2 in the WC26 album. */
  duplicateCodes: string[];
  /** Codes with qty === 0 (WC26 album codes only). */
  missingCodes: string[];
  /** WC26 codes this user has as a duplicate AND the current viewer needs. */
  matchCount: number;
};

const LISTING_LIMIT = 100;

/**
 * Fetch all public profiles + their sticker rows in two queries, compute
 * derived stats and optional match-with-viewer counts.
 */
export async function listPublicProfilesWithStats(
  supabase: SupabaseClient,
  /** Codes the viewer is currently missing (album-only). Optional. */
  viewerMissingSet?: Set<string>,
  /** Skip this user id (avoid listing the viewer themselves). */
  excludeUserId?: string
): Promise<PublicProfileSummary[]> {
  const { data: profiles, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("is_public", true)
    .order("updated_at", { ascending: false })
    .limit(LISTING_LIMIT);
  if (error) throw error;

  const filtered = (profiles ?? []).filter((p) => p.id !== excludeUserId) as Profile[];
  if (filtered.length === 0) return [];

  const ids = filtered.map((p) => p.id);
  const { data: rows, error: rowsErr } = await supabase
    .from("user_stickers")
    .select("user_id,album_id,code,quantity")
    .in("user_id", ids);
  if (rowsErr) throw rowsErr;

  // Quantities per (user, album) plus the set of albums where the user owns
  // at least one sticker.
  const wc26ByUser = new Map<string, Quantities>();
  const albumsByUser = new Map<string, Set<string>>();
  for (const r of rows ?? []) {
    const userId = r.user_id as string;
    const albumId = (r.album_id as string | null) ?? DEFAULT_SYNC_ALBUM_ID;
    const safe = clampQuantity(Number(r.quantity));
    if (safe <= 0) continue;
    const albums = albumsByUser.get(userId) ?? new Set<string>();
    albums.add(albumId);
    albumsByUser.set(userId, albums);
    if (albumId === DEFAULT_SYNC_ALBUM_ID) {
      const q = wc26ByUser.get(userId) ?? {};
      q[r.code as string] = safe;
      wc26ByUser.set(userId, q);
    }
  }

  const albumCodeSet = new Set(ALBUM_STICKERS.map((s) => s.code));

  return filtered.map((profile) => {
    const q = wc26ByUser.get(profile.id) ?? {};
    const album = computeAlbumStats(q);
    const duplicateCodes: string[] = [];
    const missingCodes: string[] = [];
    for (const sticker of ALBUM_STICKERS) {
      const qty = q[sticker.code] ?? 0;
      if (qty === 0) missingCodes.push(sticker.code);
      else if (qty >= 2) duplicateCodes.push(sticker.code);
    }
    let matchCount = 0;
    if (viewerMissingSet && viewerMissingSet.size > 0) {
      for (const code of duplicateCodes) {
        if (viewerMissingSet.has(code) && albumCodeSet.has(code)) matchCount += 1;
      }
    }
    const albumsCount = albumsByUser.get(profile.id)?.size ?? 0;
    return { profile, album, albumsCount, duplicateCodes, missingCodes, matchCount };
  });
}

/** Build a Set of album codes that the user is currently missing. */
export function viewerMissingSet(quantities: Quantities): Set<string> {
  const result = new Set<string>();
  for (const sticker of ALBUM_STICKERS) {
    if ((quantities[sticker.code] ?? 0) === 0) result.add(sticker.code);
  }
  return result;
}
