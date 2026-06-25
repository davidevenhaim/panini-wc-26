"use client";

import * as React from "react";
import { usePermissions } from "@/hooks/use-permissions";
import { CONFIG } from "@/lib/app-config";
import { createClient } from "@/lib/supabase/client";
import { fetchProfileById } from "@/lib/album/supabase-sync";
import { buildAlbumShareUrl } from "@/lib/album/share-url";

type Result = {
  shareUrl: string | null;
  username: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  hasUsername: boolean;
  isConfigured: boolean;
  /** Resolve a fresh absolute share URL (safe to call on click). */
  resolveShareUrl: () => Promise<string | null>;
};

export function useAlbumShareUrl(albumSlug: string): Result {
  const { user, isAuthenticated, isLoading: authLoading } = usePermissions();
  const [username, setUsername] = React.useState<string | null>(null);
  const [profileLoading, setProfileLoading] = React.useState(false);

  React.useEffect(() => {
    if (!CONFIG.isSupabaseConfigured || !isAuthenticated || !user) {
      setUsername(null);
      return;
    }

    let cancelled = false;
    setProfileLoading(true);
    void (async () => {
      try {
        const supabase = createClient();
        const profile = await fetchProfileById(supabase, user.id);
        if (!cancelled) setUsername(profile?.username ?? null);
      } catch {
        if (!cancelled) setUsername(null);
      } finally {
        if (!cancelled) setProfileLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, user]);

  const isLoading = authLoading || profileLoading;
  const hasUsername = Boolean(username);
  const shareUrl = username ? buildAlbumShareUrl(username, albumSlug) : null;

  const resolveShareUrl = React.useCallback(async (): Promise<string | null> => {
    if (!CONFIG.isSupabaseConfigured || !isAuthenticated || !user) return null;

    let resolved = username;
    if (!resolved) {
      try {
        const supabase = createClient();
        const profile = await fetchProfileById(supabase, user.id);
        resolved = profile?.username ?? null;
        if (resolved) setUsername(resolved);
      } catch {
        return null;
      }
    }

    return resolved ? buildAlbumShareUrl(resolved, albumSlug) : null;
  }, [albumSlug, isAuthenticated, user, username]);

  return {
    shareUrl,
    username,
    isLoading,
    isAuthenticated,
    hasUsername,
    isConfigured: CONFIG.isSupabaseConfigured,
    resolveShareUrl,
  };
}
