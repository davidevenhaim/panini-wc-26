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

type StoredShape = {
  version: number;
  updatedAt: string;
  quantities: Quantities;
};

interface CollectionState {
  quantities: Quantities;
  isHydrated: boolean;
  hydrate: () => void;
  increment: (code: string) => void;
  decrement: (code: string) => void;
  toggle: (code: string) => void;
  setQuantity: (code: string, value: number) => void;
  markTeamComplete: (team: Team) => void;
  clearTeam: (team: Team) => void;
  replaceAll: (next: Quantities) => void;
  resetAll: () => void;
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
  // versioned shape
  if (typeof raw === "object" && "quantities" in raw && raw.quantities) {
    const sanitized: Quantities = {};
    for (const [code, value] of Object.entries(raw.quantities)) {
      const safe = clampQuantity(value as number);
      if (safe > 0) sanitized[code] = safe;
    }
    return sanitized;
  }
  // legacy plain map fallback
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

export const useCollectionStore = create<CollectionState>((set, get) => ({
  quantities: {},
  isHydrated: false,
  hydrate: () => {
    if (get().isHydrated) return;
    const quantities = loadFromStorage();
    set({ quantities, isHydrated: true });
  },
  increment: (code) => {
    const next = incrementPure(get().quantities, code);
    persist(next);
    set({ quantities: next });
  },
  decrement: (code) => {
    const next = decrementPure(get().quantities, code);
    persist(next);
    set({ quantities: next });
  },
  toggle: (code) => {
    const next = togglePure(get().quantities, code);
    persist(next);
    set({ quantities: next });
  },
  setQuantity: (code, value) => {
    const next = setQtyPure(get().quantities, code, value);
    persist(next);
    set({ quantities: next });
  },
  markTeamComplete: (team) => {
    const next = markTeamPure(team, get().quantities);
    persist(next);
    set({ quantities: next });
  },
  clearTeam: (team) => {
    const next = clearTeamPure(team, get().quantities);
    persist(next);
    set({ quantities: next });
  },
  replaceAll: (next) => {
    persist(next);
    set({ quantities: next });
  },
  resetAll: () => {
    removeStorage(COLLECTION_STORAGE_KEY);
    set({ quantities: {} });
  },
}));
