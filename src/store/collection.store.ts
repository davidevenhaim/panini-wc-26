"use client";

import { create } from "zustand";
import { getStorage, setStorage, removeStorage } from "@/hooks/use-local-storage";
import type { Team } from "@/types/album.types";
import {
  COLLECTION_STORAGE_KEY,
  COLLECTION_VERSION,
  clampQuantity,
  clearTeam as clearTeamPure,
  decrementSticker as decrementPure,
  incrementSticker as incrementPure,
  markTeamComplete as markTeamPure,
  setStickerQuantity as setQtyPure,
  toggleSticker as togglePure,
  type Quantities,
} from "@/lib/album/collection";
import { createClient } from "@/lib/supabase/client";
import {
  fetchUserStickers,
  pushUserStickers,
  replaceUserStickers,
} from "@/lib/album/supabase-sync";

type StoredShape = {
  version: number;
  updatedAt: string;
  quantities: Quantities;
};

interface CollectionState {
  quantities: Quantities;
  isHydrated: boolean;
  /** Current synced user id, or null when logged out / local-only. */
  syncUserId: string | null;
  /** Codes pending push to Supabase. */
  dirtyCodes: Set<string>;
  hydrate: () => void;
  /** Connect to a Supabase user — hydrate from server (or upload local). */
  attachUser: (userId: string) => Promise<void>;
  detachUser: () => void;
  increment: (code: string) => void;
  decrement: (code: string) => void;
  toggle: (code: string) => void;
  setQuantity: (code: string, value: number) => void;
  markTeamComplete: (team: Team) => void;
  clearTeam: (team: Team) => void;
  replaceAll: (next: Quantities) => void;
  resetAll: () => void;
  /** Force-flush pending changes to Supabase. */
  flushSync: () => Promise<void>;
}

function persist(quantities: Quantities) {
  const payload: StoredShape = {
    version: COLLECTION_VERSION,
    updatedAt: new Date().toISOString(),
    quantities,
  };
  setStorage(COLLECTION_STORAGE_KEY, payload);
}

function loadFromStorage(): Quantities {
  if (typeof window === "undefined") return {};
  const raw = getStorage(COLLECTION_STORAGE_KEY) as StoredShape | Quantities | null;
  if (!raw) return {};
  if (typeof raw === "object" && "quantities" in raw && raw.quantities) {
    const sanitized: Quantities = {};
    for (const [code, value] of Object.entries(raw.quantities)) {
      const safe = clampQuantity(value as number);
      if (safe > 0) sanitized[code] = safe;
    }
    return sanitized;
  }
  if (typeof raw === "object") {
    const sanitized: Quantities = {};
    for (const [code, value] of Object.entries(raw)) {
      const safe = clampQuantity(value as number);
      if (safe > 0) sanitized[code] = safe;
    }
    return sanitized;
  }
  return {};
}

// Module-scoped debounce timer for pushing dirty rows to Supabase.
let pushTimer: ReturnType<typeof setTimeout> | null = null;
const PUSH_DEBOUNCE_MS = 600;

export const useCollectionStore = create<CollectionState>((set, get) => {
  function scheduleSync() {
    const { syncUserId, dirtyCodes } = get();
    if (!syncUserId || dirtyCodes.size === 0) return;
    if (pushTimer) clearTimeout(pushTimer);
    pushTimer = setTimeout(() => {
      void get().flushSync();
    }, PUSH_DEBOUNCE_MS);
  }

  function markDirty(codes: string[]) {
    if (codes.length === 0) return;
    const next = new Set(get().dirtyCodes);
    for (const c of codes) next.add(c);
    set({ dirtyCodes: next });
    scheduleSync();
  }

  function diff(prev: Quantities, next: Quantities): string[] {
    const codes = new Set<string>();
    for (const k of Object.keys(next)) if (prev[k] !== next[k]) codes.add(k);
    for (const k of Object.keys(prev)) if (prev[k] !== next[k]) codes.add(k);
    return [...codes];
  }

  return {
    quantities: {},
    isHydrated: false,
    syncUserId: null,
    dirtyCodes: new Set<string>(),
    hydrate: () => {
      if (get().isHydrated) return;
      const quantities = loadFromStorage();
      set({ quantities, isHydrated: true });
    },
    attachUser: async (userId) => {
      const supabase = createClient();
      const remote = await fetchUserStickers(supabase, userId);
      const local = get().quantities;
      const remoteEmpty = Object.keys(remote).length === 0;
      const localEmpty = Object.keys(local).length === 0;

      if (remoteEmpty && !localEmpty) {
        // Upload local to remote on first sync.
        await replaceUserStickers(supabase, userId, local);
        set({ syncUserId: userId, dirtyCodes: new Set() });
        return;
      }
      // Otherwise, server wins.
      persist(remote);
      set({
        quantities: remote,
        syncUserId: userId,
        dirtyCodes: new Set(),
      });
    },
    detachUser: () => {
      set({ syncUserId: null, dirtyCodes: new Set() });
    },
    flushSync: async () => {
      const { syncUserId, quantities, dirtyCodes } = get();
      if (!syncUserId || dirtyCodes.size === 0) return;
      const codes = [...dirtyCodes];
      // Clear before push so changes during request are tracked.
      set({ dirtyCodes: new Set() });
      const payload = codes.map((code) => ({
        code,
        quantity: quantities[code] ?? 0,
      }));
      try {
        const supabase = createClient();
        await pushUserStickers(supabase, syncUserId, payload);
      } catch (err) {
        // Re-mark dirty on failure so retry happens next change.
        if (process.env.NODE_ENV !== "production") console.error("[sync push]", err);
        const next = new Set(get().dirtyCodes);
        for (const c of codes) next.add(c);
        set({ dirtyCodes: next });
      }
    },
    increment: (code) => {
      const next = incrementPure(get().quantities, code);
      persist(next);
      set({ quantities: next });
      markDirty([code]);
    },
    decrement: (code) => {
      const next = decrementPure(get().quantities, code);
      persist(next);
      set({ quantities: next });
      markDirty([code]);
    },
    toggle: (code) => {
      const next = togglePure(get().quantities, code);
      persist(next);
      set({ quantities: next });
      markDirty([code]);
    },
    setQuantity: (code, value) => {
      const next = setQtyPure(get().quantities, code, value);
      persist(next);
      set({ quantities: next });
      markDirty([code]);
    },
    markTeamComplete: (team) => {
      const prev = get().quantities;
      const next = markTeamPure(team, prev);
      persist(next);
      set({ quantities: next });
      markDirty(diff(prev, next));
    },
    clearTeam: (team) => {
      const prev = get().quantities;
      const next = clearTeamPure(team, prev);
      persist(next);
      set({ quantities: next });
      markDirty(diff(prev, next));
    },
    replaceAll: (next) => {
      const prev = get().quantities;
      persist(next);
      set({ quantities: next });
      if (get().syncUserId) {
        // Full replace: push wholesale.
        void (async () => {
          try {
            const supabase = createClient();
            await replaceUserStickers(supabase, get().syncUserId!, next);
            set({ dirtyCodes: new Set() });
          } catch (err) {
            if (process.env.NODE_ENV !== "production") console.error("[sync replace]", err);
            markDirty(diff(prev, next));
          }
        })();
      }
    },
    resetAll: () => {
      const prev = get().quantities;
      removeStorage(COLLECTION_STORAGE_KEY);
      set({ quantities: {} });
      if (get().syncUserId) {
        markDirty(Object.keys(prev));
      }
    },
  };
});
