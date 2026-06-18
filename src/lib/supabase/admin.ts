import { createClient } from "@supabase/supabase-js";
import { CONFIG } from "@/lib/app-config";

/**
 * Server-only admin Supabase client backed by the service-role key.
 * RLS is bypassed. Never import this from Client Components or expose
 * the key to `NEXT_PUBLIC_*` env vars.
 *
 * Reads `SUPABASE_SERVICE_ROLE_KEY` (or `SUPABASE_SECRET_KEY` for the
 * newer `sb_secret_*` convention). Throws if neither is set.
 */
export function createAdminClient() {
  const url = CONFIG.supabaseUrl;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY ?? "";
  if (!url || !key) {
    throw new Error(
      "Admin Supabase client requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY"
    );
  }
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
