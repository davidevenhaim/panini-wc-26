"use client";

import { create } from "zustand";
import { removeStorage } from "@/hooks/use-local-storage";
import {
  localStorageGetItem,
  localStorageSetItem,
  localStorageRemoveItem,
} from "@/utils/local-storage.utils";
import type { Team, SpecialSection } from "@/types/album.types";
import {
  clampQuantity,
  clearTeam as clearTeamPure,
  decrementSticker as decrementPure,
  incrementSticker as incrementPure,
  markTeamComplete as markTeamPure,
  markGroupComplete as markGroupPure,
  markSectionComplete as markSectionPure,
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
import {
  LEGACY_WC26_TARGET_ALBUM_ID,
  LIBRARY_STORAGE_KEY,
  emptyLibrary,
  hydrateLibraryFromStorage,
  sanitizeLibrary,
  writeLibraryToStorage,
  type PersistedCollectionLibrary,
} from "@/collections/storage-migration";

/** Default album id for cold-start state. */
const DEFAULT_ACTIVE_ALBUM_ID = LEGACY_WC26_TARGET_ALBUM_ID;

interface CollectionState {
  /** Versioned library payload — sole source of truth for persisted quantities. */
  library: PersistedCollectionLibrary;
  /** Album the UI is currently editing. */
  activeAlbumId: string;
  /** Active album's quantities — derived; kept in state for cheap selector reads. */
  quantities: Quantities;
  isHydrated: boolean;
  /** Current synced user id, or null when logged out / local-only. */
  syncUserId: string | null;
  /** Per-album pending pushes. Each entry is the set of codes that changed locally. */
  dirtyByAlbum: Record<string, Set<string>>;
  hydrate: () => void;
  setActiveAlbum: (albumId: string) => void;
  /** Connect to a Supabase user — hydrate the active album from server (or upload local). */
  attachUser: (userId: string) => Promise<void>;
  detachUser: () => void;
  increment: (code: string) => void;
  decrement: (code: string) => void;
  toggle: (code: string) => void;
  setQuantity: (code: string, value: number) => void;
  markTeamComplete: (team: Team) => void;
  markGroupComplete: (group: string) => void;
  markSectionComplete: (section: Pick<SpecialSection, "stickers">) => void;
  /** Mark every supplied code as qty 1 (no-op for codes already ≥ 1). */
  markCodesComplete: (codes: string[]) => void;
  clearTeam: (team: Team) => void;
  /** Replace the active album's quantities (used by import). */
  replaceAll: (next: Quantities) => void;
  /** Reset the active album. */
  resetAll: () => void;
  /** Force-flush pending Supabase changes. */
  flushSync: () => Promise<void>;
  /** Read another album's quantities (read-only). */
  getAlbumQuantities: (albumId: string) => Quantities;
}

const storageAdapter = {
  read: (key: string) => localStorageGetItem(key) || null,
  write: (key: string, value: string) => localStorageSetItem(key, value),
  remove: (key: string) => localStorageRemoveItem(key),
};

function loadLibrary(): PersistedCollectionLibrary {
  if (typeof window === "undefined") return emptyLibrary();
  return hydrateLibraryFromStorage(storageAdapter);
}

function persistLibrary(library: PersistedCollectionLibrary) {
  if (typeof window === "undefined") return;
  writeLibraryToStorage(library, { write: (k, v) => localStorageSetItem(k, v) });
}

function writeAlbumQuantities(
  library: PersistedCollectionLibrary,
  albumId: string,
  quantities: Quantities
): PersistedCollectionLibrary {
  return {
    ...library,
    albums: {
      ...library.albums,
      [albumId]: {
        updatedAt: new Date().toISOString(),
        quantities,
      },
    },
  };
}

function touchRecentlyOpened(
  library: PersistedCollectionLibrary,
  albumId: string
): PersistedCollectionLibrary {
  const next = library.recentlyOpenedAlbumIds.filter((id) => id !== albumId);
  next.unshift(albumId);
  return { ...library, activeAlbumId: albumId, recentlyOpenedAlbumIds: next.slice(0, 16) };
}

let pushTimer: ReturnType<typeof setTimeout> | null = null;
const PUSH_DEBOUNCE_MS = 600;

export const useCollectionStore = create<CollectionState>((set, get) => {
  function scheduleSync() {
    const { syncUserId, dirtyByAlbum } = get();
    if (!syncUserId) return;
    const hasDirty = Object.values(dirtyByAlbum).some((s) => s.size > 0);
    if (!hasDirty) return;
    if (pushTimer) clearTimeout(pushTimer);
    pushTimer = setTimeout(() => void get().flushSync(), PUSH_DEBOUNCE_MS);
  }

  function markDirtyFor(albumId: string, codes: string[]) {
    if (codes.length === 0) return;
    const current = get().dirtyByAlbum;
    const next = { ...current };
    const set0 = new Set(current[albumId] ?? []);
    for (const c of codes) set0.add(c);
    next[albumId] = set0;
    set({ dirtyByAlbum: next });
    scheduleSync();
  }

  function markDirty(codes: string[]) {
    markDirtyFor(get().activeAlbumId, codes);
  }

  function diff(prev: Quantities, next: Quantities): string[] {
    const codes = new Set<string>();
    for (const k of Object.keys(next)) if (prev[k] !== next[k]) codes.add(k);
    for (const k of Object.keys(prev)) if (prev[k] !== next[k]) codes.add(k);
    return [...codes];
  }

  function applyToActive(updater: (prev: Quantities) => Quantities) {
    const { library, activeAlbumId } = get();
    const prev = library.albums[activeAlbumId]?.quantities ?? {};
    const next = updater(prev);
    const newLibrary = writeAlbumQuantities(library, activeAlbumId, next);
    persistLibrary(newLibrary);
    set({ library: newLibrary, quantities: next });
    return { prev, next };
  }

  return {
    library: emptyLibrary(),
    activeAlbumId: DEFAULT_ACTIVE_ALBUM_ID,
    quantities: {},
    isHydrated: false,
    syncUserId: null,
    dirtyByAlbum: {},

    hydrate: () => {
      if (get().isHydrated) return;
      const library = loadLibrary();
      const activeAlbumId = library.activeAlbumId ?? DEFAULT_ACTIVE_ALBUM_ID;
      const quantities = library.albums[activeAlbumId]?.quantities ?? {};
      set({ library, activeAlbumId, quantities, isHydrated: true });

      if (typeof window !== "undefined") {
        // Cross-tab sync: when another tab writes the library, re-read it so
        // both tabs converge on the latest state (last-write-wins, but no
        // silent destruction — we only ever update from a valid payload).
        window.addEventListener("storage", (e) => {
          if (e.key !== LIBRARY_STORAGE_KEY) return;
          if (!e.newValue) return;
          let parsed: unknown = null;
          try {
            parsed = JSON.parse(e.newValue);
          } catch {
            return;
          }
          const nextLibrary = sanitizeLibrary(parsed);
          const activeId = get().activeAlbumId;
          set({
            library: nextLibrary,
            quantities: nextLibrary.albums[activeId]?.quantities ?? {},
          });
        });
      }
    },

    setActiveAlbum: (albumId) => {
      const { library, activeAlbumId } = get();
      if (activeAlbumId === albumId) return;
      const nextLibrary = touchRecentlyOpened(library, albumId);
      persistLibrary(nextLibrary);
      const quantities = nextLibrary.albums[albumId]?.quantities ?? {};
      set({ library: nextLibrary, activeAlbumId: albumId, quantities });
    },

    attachUser: async (userId) => {
      const supabase = createClient();
      const { library, activeAlbumId } = get();
      const remote = await fetchUserStickers(supabase, userId, activeAlbumId);
      const local = library.albums[activeAlbumId]?.quantities ?? {};
      const remoteEmpty = Object.keys(remote).length === 0;
      const localEmpty = Object.keys(local).length === 0;

      if (remoteEmpty && !localEmpty) {
        await replaceUserStickers(supabase, userId, local, activeAlbumId);
        set({ syncUserId: userId, dirtyByAlbum: {} });
        return;
      }
      const newLibrary = writeAlbumQuantities(library, activeAlbumId, remote);
      persistLibrary(newLibrary);
      set({
        library: newLibrary,
        quantities: remote,
        syncUserId: userId,
        dirtyByAlbum: {},
      });
    },

    detachUser: () => set({ syncUserId: null, dirtyByAlbum: {} }),

    flushSync: async () => {
      const { syncUserId, dirtyByAlbum, library } = get();
      if (!syncUserId) return;
      const albumIds = Object.keys(dirtyByAlbum).filter((id) => dirtyByAlbum[id].size > 0);
      if (albumIds.length === 0) return;
      set({ dirtyByAlbum: {} });

      const supabase = createClient();
      for (const albumId of albumIds) {
        const codes = [...dirtyByAlbum[albumId]];
        const quantities = library.albums[albumId]?.quantities ?? {};
        const payload = codes.map((code) => ({ code, quantity: quantities[code] ?? 0 }));
        try {
          await pushUserStickers(supabase, syncUserId, payload, albumId);
        } catch (err) {
          if (process.env.NODE_ENV !== "production") console.error("[sync push]", albumId, err);
          markDirtyFor(albumId, codes);
        }
      }
    },

    increment: (code) => {
      const { prev, next } = applyToActive((q) => incrementPure(q, code));
      void prev;
      void next;
      markDirty([code]);
    },
    decrement: (code) => {
      applyToActive((q) => decrementPure(q, code));
      markDirty([code]);
    },
    toggle: (code) => {
      applyToActive((q) => togglePure(q, code));
      markDirty([code]);
    },
    setQuantity: (code, value) => {
      applyToActive((q) => setQtyPure(q, code, value));
      markDirty([code]);
    },
    markTeamComplete: (team) => {
      const { prev, next } = applyToActive((q) => markTeamPure(team, q));
      markDirty(diff(prev, next));
    },
    markGroupComplete: (group) => {
      const { prev, next } = applyToActive((q) => markGroupPure(group, q));
      markDirty(diff(prev, next));
    },
    markSectionComplete: (section) => {
      const { prev, next } = applyToActive((q) => markSectionPure(section, q));
      markDirty(diff(prev, next));
    },
    markCodesComplete: (codes) => {
      if (codes.length === 0) return;
      const { prev, next } = applyToActive((q) => {
        const out = { ...q };
        for (const code of codes) {
          if (clampQuantity(out[code] ?? 0) === 0) out[code] = 1;
        }
        return out;
      });
      markDirty(diff(prev, next));
    },
    clearTeam: (team) => {
      const { prev, next } = applyToActive((q) => clearTeamPure(team, q));
      markDirty(diff(prev, next));
    },
    replaceAll: (nextQuantities) => {
      const sanitized: Quantities = {};
      for (const [code, value] of Object.entries(nextQuantities)) {
        const safe = clampQuantity(value);
        if (safe > 0) sanitized[code] = safe;
      }
      const { library, activeAlbumId, syncUserId } = get();
      const prev = library.albums[activeAlbumId]?.quantities ?? {};
      const newLibrary = writeAlbumQuantities(library, activeAlbumId, sanitized);
      persistLibrary(newLibrary);
      set({ library: newLibrary, quantities: sanitized });
      if (syncUserId) {
        void (async () => {
          try {
            const supabase = createClient();
            await replaceUserStickers(supabase, syncUserId, sanitized, activeAlbumId);
          } catch (err) {
            if (process.env.NODE_ENV !== "production") console.error("[sync replace]", err);
            markDirtyFor(activeAlbumId, diff(prev, sanitized));
          }
        })();
      }
    },
    resetAll: () => {
      const { library, activeAlbumId } = get();
      const prev = library.albums[activeAlbumId]?.quantities ?? {};
      const newLibrary: PersistedCollectionLibrary = {
        ...library,
        albums: {
          ...library.albums,
          [activeAlbumId]: { updatedAt: new Date().toISOString(), quantities: {} },
        },
      };
      // If the library is now empty for the active album, also delete the entry.
      if (Object.keys(prev).length === 0) {
        delete newLibrary.albums[activeAlbumId];
      }
      persistLibrary(newLibrary);
      set({ library: newLibrary, quantities: {} });
      if (get().syncUserId) {
        markDirtyFor(activeAlbumId, Object.keys(prev));
      }
    },
    getAlbumQuantities: (albumId) => get().library.albums[albumId]?.quantities ?? {},
  };
});

/**
 * Convenience helper: also persisted alongside the storage helpers — used by
 * places that need to nuke storage in tests / dev.
 */
export function _internal_clearLibraryStorage() {
  if (typeof window === "undefined") return;
  removeStorage(LIBRARY_STORAGE_KEY);
}
