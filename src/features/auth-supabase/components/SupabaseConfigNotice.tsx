"use client";

import { useTranslations } from "next-intl";
import { CONFIG } from "@/lib/app-config";
import Iconify from "@/components/ui/iconify";
import { Typography } from "@/components/ui/typography";

/**
 * Inline notice shown on auth pages when Supabase env vars are missing.
 * Hidden once NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_ANON_KEY are set.
 */
export function SupabaseConfigNotice() {
  const t = useTranslations("authSupabase");
  if (CONFIG.isSupabaseConfigured) return null;

  return (
    <div className="flex items-start gap-3 rounded-md border border-amber-500/40 bg-amber-50 p-3 dark:bg-amber-950/30">
      <Iconify
        icon="lucide:info"
        className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-400"
      />
      <div className="space-y-1">
        <Typography variant="caption1" className="font-medium">
          {t("supabaseNotConfiguredTitle")}
        </Typography>
        <Typography variant="caption2" color="muted">
          {t("supabaseNotConfiguredHint")}
        </Typography>
      </div>
    </div>
  );
}
