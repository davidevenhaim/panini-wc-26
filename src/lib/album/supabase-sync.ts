import type { SupabaseClient } from "@supabase/supabase-js";
import type { Profile, ProfileUpsert } from "@/types/profile.types";
import { clampQuantity, type Quantities } from "./collection";

export async function fetchUserStickers(
  supabase: SupabaseClient,
  userId: string
): Promise<Quantities> {
  const { data, error } = await supabase
    .from("user_stickers")
    .select("code, quantity")
    .eq("user_id", userId);
  if (error) throw error;
  const result: Quantities = {};
  for (const row of data ?? []) {
    const safe = clampQuantity(Number(row.quantity));
    if (safe > 0) result[row.code as string] = safe;
  }
  return result;
}

/**
 * Upsert (or delete when qty=0) sticker rows for a user.
 * Pass only the codes that changed since last sync.
 */
export async function pushUserStickers(
  supabase: SupabaseClient,
  userId: string,
  changes: { code: string; quantity: number }[]
): Promise<void> {
  if (changes.length === 0) return;
  const toUpsert = changes
    .filter((c) => c.quantity > 0)
    .map((c) => ({ user_id: userId, code: c.code, quantity: clampQuantity(c.quantity) }));
  const toDelete = changes.filter((c) => c.quantity <= 0).map((c) => c.code);

  if (toUpsert.length > 0) {
    const { error } = await supabase
      .from("user_stickers")
      .upsert(toUpsert, { onConflict: "user_id,code" });
    if (error) throw error;
  }
  if (toDelete.length > 0) {
    const { error } = await supabase
      .from("user_stickers")
      .delete()
      .eq("user_id", userId)
      .in("code", toDelete);
    if (error) throw error;
  }
}

/** Bulk replace all sticker rows for a user. Used on import. */
export async function replaceUserStickers(
  supabase: SupabaseClient,
  userId: string,
  quantities: Quantities
): Promise<void> {
  const { error: delErr } = await supabase.from("user_stickers").delete().eq("user_id", userId);
  if (delErr) throw delErr;
  const rows = Object.entries(quantities)
    .filter(([, qty]) => clampQuantity(qty) > 0)
    .map(([code, qty]) => ({ user_id: userId, code, quantity: clampQuantity(qty) }));
  if (rows.length === 0) return;
  const { error } = await supabase.from("user_stickers").insert(rows);
  if (error) throw error;
}

export async function fetchProfileById(
  supabase: SupabaseClient,
  userId: string
): Promise<Profile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();
  if (error) throw error;
  return (data as Profile | null) ?? null;
}

export async function fetchProfileByUsername(
  supabase: SupabaseClient,
  username: string
): Promise<Profile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", username)
    .maybeSingle();
  if (error) throw error;
  return (data as Profile | null) ?? null;
}

export async function upsertProfile(
  supabase: SupabaseClient,
  userId: string,
  patch: ProfileUpsert
): Promise<Profile> {
  const payload = { id: userId, ...patch };
  const { data, error } = await supabase
    .from("profiles")
    .upsert(payload, { onConflict: "id" })
    .select("*")
    .single();
  if (error) throw error;
  return data as Profile;
}
