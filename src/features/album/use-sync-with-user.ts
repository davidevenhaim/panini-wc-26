"use client";

import * as React from "react";
import { usePermissions } from "@/hooks/use-permissions";
import { toastError } from "@/lib/toast";
import { useCollectionStore } from "@/store/collection.store";

/**
 * Watches Supabase auth state and:
 * - attaches the collection store to the user's row on login (hydrate from server,
 *   or upload local if server is empty)
 * - detaches on logout
 */
export function useSyncWithUser() {
  const { user } = usePermissions();
  const attachUser = useCollectionStore((s) => s.attachUser);
  const detachUser = useCollectionStore((s) => s.detachUser);
  const isHydrated = useCollectionStore((s) => s.isHydrated);
  const syncUserId = useCollectionStore((s) => s.syncUserId);

  React.useEffect(() => {
    // Wait for local hydrate first so an "upload local" sync can include it.
    if (!isHydrated) return;
    if (!user) {
      if (syncUserId) detachUser();
      return;
    }
    if (syncUserId === user.id) return;
    attachUser(user.id).catch((err) => {
      if (process.env.NODE_ENV !== "production") console.error("[sync attach]", err);
      toastError("Sync failed");
    });
  }, [user, isHydrated, syncUserId, attachUser, detachUser]);
}
