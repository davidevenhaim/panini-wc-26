export type AppConfig = {
  appName: string;
  appVersion: string;
  serverUrl: string;
  webUrl: string;
  /** Absolute URL used for OG tags and image resolution. */
  siteUrl: string;
  region: string;
  supportEmail: string;
  isProd: boolean;
  isDev: boolean;
  /** When true, only Google OAuth is allowed (email/password disabled). */
  isGoogleOnlyAuth: boolean;
  supabaseUrl: string;
  /**
   * Browser-safe Supabase API key. Prefers `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   * (current Supabase convention — values look like `sb_publishable_*`).
   * Falls back to the legacy `NEXT_PUBLIC_SUPABASE_ANON_KEY` JWT for back-compat.
   */
  supabasePublishableKey: string;
  /** @deprecated Alias for `supabasePublishableKey`. Kept for back-compat. */
  supabaseAnonKey: string;
  /** True when both supabase env vars are present. */
  isSupabaseConfigured: boolean;
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabasePublishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "";

export const CONFIG: AppConfig = {
  appName: process.env.NEXT_PUBLIC_APP_NAME || "",
  appVersion: process.env.NEXT_PUBLIC_APP_VERSION || "1.0.0",
  serverUrl: process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3005",
  webUrl: process.env.NEXT_PUBLIC_WEB_URL || "http://localhost:3000",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  region: process.env.NEXT_PUBLIC_REGION || "IL",
  supportEmail: process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "",
  isProd: process.env.NODE_ENV === "production",
  isDev: process.env.NODE_ENV === "development",
  isGoogleOnlyAuth: process.env.NODE_ENV === "production",
  supabaseUrl,
  supabasePublishableKey,
  supabaseAnonKey: supabasePublishableKey,
  isSupabaseConfigured: Boolean(supabaseUrl && supabasePublishableKey),
};

// Warn in development if required env vars are not set.
// Never throws — a missing var is better than a crashed page.
if (process.env.NODE_ENV === "development") {
  const required: Array<keyof AppConfig> = ["appName", "serverUrl", "siteUrl"];
  for (const key of required) {
    if (!CONFIG[key]) {
      console.warn(`[config] Missing env var for "${key}". Check .env.local.`);
    }
  }
}
