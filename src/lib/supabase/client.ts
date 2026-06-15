import { createBrowserClient } from "@supabase/ssr";
import { CONFIG } from "@/lib/app-config";

/**
 * Browser-side Supabase client. Use in Client Components.
 * Safe to call when env vars are missing — returns a stub client that
 * surfaces a clear error instead of crashing the page.
 */
export function createClient() {
  if (!CONFIG.isSupabaseConfigured) {
    return createBrowserClient("https://placeholder.supabase.co", "placeholder-anon-key");
  }
  return createBrowserClient(CONFIG.supabaseUrl, CONFIG.supabaseAnonKey);
}
