import type { SupabaseClient } from "@supabase/supabase-js";
import type { Profile } from "@/types/profile.types";
import { ALBUM_STICKERS } from "@/constants/album";
import { clampQuantity, computeAlbumStats, type Quantities } from "./collection";

export type PublicProfileSummary = {
  profile: Profile;
  album: ReturnType<typeof computeAlbumStats>;
  /** Codes with qty >= 2. */
  duplicateCodes: string[];
  /** Codes with qty === 0 (album codes only). */
  missingCodes: string[];
  /** Codes this user has as a duplicate AND the current viewer needs. */
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
    .select("user_id,code,quantity")
    .in("user_id", ids);
  if (rowsErr) throw rowsErr;

  const byUser = new Map<string, Quantities>();
  for (const r of rows ?? []) {
    const q = byUser.get(r.user_id as string) ?? {};
    const safe = clampQuantity(Number(r.quantity));
    if (safe > 0) q[r.code as string] = safe;
    byUser.set(r.user_id as string, q);
  }

  const albumCodeSet = new Set(ALBUM_STICKERS.map((s) => s.code));

  return filtered.map((profile) => {
    const q = byUser.get(profile.id) ?? {};
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
    return { profile, album, duplicateCodes, missingCodes, matchCount };
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
