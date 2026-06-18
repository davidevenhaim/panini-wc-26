import type { SupabaseClient } from "@supabase/supabase-js";
import type { Album } from "@/collections/schema";

/**
 * Row shape for `public.album_structures` (see
 * supabase/migrations/0006_album_structures.sql). One row per album.
 */
export type AlbumStructureRow = {
  id: string;
  name_key: string;
  structure: Album;
  version: number;
  created_at: string;
  updated_at: string;
};

export type AlbumStructureUpsert = {
  id: string;
  name_key: string;
  structure: Album;
  version?: number;
};

/** Convert an in-memory Album into the payload stored in the table. */
export function serializeAlbumStructure(album: Album, version = 1): AlbumStructureUpsert {
  return {
    id: album.id,
    name_key: album.slug,
    structure: album,
    version,
  };
}

export async function fetchAlbumStructureById(
  supabase: SupabaseClient,
  id: string
): Promise<AlbumStructureRow | null> {
  const { data, error } = await supabase
    .from("album_structures")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return (data as AlbumStructureRow | null) ?? null;
}

export async function fetchAlbumStructureByNameKey(
  supabase: SupabaseClient,
  nameKey: string
): Promise<AlbumStructureRow | null> {
  const { data, error } = await supabase
    .from("album_structures")
    .select("*")
    .eq("name_key", nameKey)
    .maybeSingle();
  if (error) throw error;
  return (data as AlbumStructureRow | null) ?? null;
}

export async function listAlbumStructures(supabase: SupabaseClient): Promise<AlbumStructureRow[]> {
  const { data, error } = await supabase
    .from("album_structures")
    .select("*")
    .order("name_key", { ascending: true });
  if (error) throw error;
  return (data as AlbumStructureRow[] | null) ?? [];
}

/**
 * Insert or update a single album structure. The caller must use a
 * service-role Supabase client — anon/authed clients are blocked by RLS.
 */
export async function upsertAlbumStructure(
  supabase: SupabaseClient,
  album: Album,
  version = 1
): Promise<AlbumStructureRow> {
  const payload = serializeAlbumStructure(album, version);
  const { data, error } = await supabase
    .from("album_structures")
    .upsert(payload, { onConflict: "id" })
    .select("*")
    .single();
  if (error) throw error;
  return data as AlbumStructureRow;
}

/** Bulk upsert. Same RLS rules as `upsertAlbumStructure`. */
export async function upsertAlbumStructures(
  supabase: SupabaseClient,
  albums: Album[],
  version = 1
): Promise<AlbumStructureRow[]> {
  if (albums.length === 0) return [];
  const payload = albums.map((a) => serializeAlbumStructure(a, version));
  const { data, error } = await supabase
    .from("album_structures")
    .upsert(payload, { onConflict: "id" })
    .select("*");
  if (error) throw error;
  return (data as AlbumStructureRow[] | null) ?? [];
}

export async function deleteAlbumStructure(supabase: SupabaseClient, id: string): Promise<void> {
  const { error } = await supabase.from("album_structures").delete().eq("id", id);
  if (error) throw error;
}
