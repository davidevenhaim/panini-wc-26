import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { CONFIG } from "@/lib/app-config";

/**
 * Refreshes the Supabase auth session cookie on every matching request.
 * Required by @supabase/ssr to keep server-side auth state in sync.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  if (!CONFIG.isSupabaseConfigured) return supabaseResponse;

  const supabase = createServerClient(CONFIG.supabaseUrl, CONFIG.supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  // IMPORTANT: getUser() must be called to refresh the session cookie.
  // Do not remove or place anything between createServerClient and getUser.
  await supabase.auth.getUser();

  return supabaseResponse;
}
