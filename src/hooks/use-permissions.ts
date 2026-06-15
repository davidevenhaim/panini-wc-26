"use client";

import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { CONFIG } from "@/lib/app-config";

/**
 * Lightweight auth/permission hook backed by Supabase session.
 *
 * Returns the current `user` and `isAuthenticated`.
 *
 * To extend with roles:
 *   - Store role in Supabase user.app_metadata.role (server-only) or
 *     user.user_metadata.role (user-editable, not for authz).
 *   - Read it here:  const role = user?.app_metadata?.role as string | undefined;
 *   - Return { role, isAdmin: role === "admin", hasRole: (r) => ... } from this hook.
 *   - Keep authorization checks on the server too (RLS policies in Supabase).
 */
export type UsePermissionsReturn = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
};

export function usePermissions(): UsePermissionsReturn {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(CONFIG.isSupabaseConfigured);

  useEffect(() => {
    if (!CONFIG.isSupabaseConfigured) return;
    const supabase = createClient();
    let mounted = true;

    supabase.auth.getUser().then(({ data }) => {
      if (!mounted) return;
      setUser(data.user ?? null);
      setIsLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return {
    user,
    isAuthenticated: !!user,
    isLoading,
  };
}
