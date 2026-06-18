import { NextResponse } from "next/server";
import { ALBUMS } from "@/collections/catalog";
import { upsertAlbumStructures } from "@/lib/album/album-structures";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * POST /api/admin/sync-album-structures
 *
 * Pushes every album in the catalog into the `album_structures` table.
 * Gated by the `ADMIN_SYNC_TOKEN` env var:
 *
 *   curl -X POST http://localhost:3000/api/admin/sync-album-structures \
 *     -H "x-admin-token: $ADMIN_SYNC_TOKEN"
 *
 * Uses the service-role Supabase client (RLS bypassed). Not exposed in
 * the UI — intended to run from CI or an operator's terminal after the
 * catalog changes.
 */
export async function POST(request: Request) {
  const expected = process.env.ADMIN_SYNC_TOKEN;
  if (!expected) {
    return NextResponse.json(
      { ok: false, error: "ADMIN_SYNC_TOKEN env var is not configured" },
      { status: 500 }
    );
  }
  const provided = request.headers.get("x-admin-token");
  if (provided !== expected) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  let supabase;
  try {
    supabase = createAdminClient();
  } catch (err) {
    return NextResponse.json({ ok: false, error: (err as Error).message }, { status: 500 });
  }

  const rows = await upsertAlbumStructures(supabase, ALBUMS);
  return NextResponse.json({
    ok: true,
    count: rows.length,
    ids: rows.map((r) => r.id),
  });
}
