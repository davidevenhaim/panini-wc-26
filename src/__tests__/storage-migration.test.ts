import { describe, it, expect } from "vitest";
import {
  LEGACY_BACKUP_SUFFIX,
  LEGACY_WC26_STORAGE_KEY,
  LEGACY_WC26_TARGET_ALBUM_ID,
  LIBRARY_STORAGE_KEY,
  LIBRARY_VERSION,
  emptyLibrary,
  hydrateLibraryFromStorage,
  migrateLegacyPayload,
  sanitizeLibrary,
} from "@/collections/storage-migration";

function makeStorageAdapter(initial: Record<string, string> = {}) {
  const data: Record<string, string> = { ...initial };
  return {
    data,
    read: (key: string) => (key in data ? data[key] : null),
    write: (key: string, value: string) => {
      data[key] = value;
    },
    remove: (key: string) => {
      delete data[key];
    },
  };
}

describe("migrateLegacyPayload", () => {
  it("converts the v1 single-album shape into a v2 library", () => {
    const result = migrateLegacyPayload({
      version: 1,
      updatedAt: "2026-01-01T00:00:00.000Z",
      quantities: { MEX1: 2, FWC1: 1 },
    });
    expect(result.version).toBe(LIBRARY_VERSION);
    expect(result.activeAlbumId).toBe(LEGACY_WC26_TARGET_ALBUM_ID);
    expect(result.albums[LEGACY_WC26_TARGET_ALBUM_ID]).toBeTruthy();
    expect(result.albums[LEGACY_WC26_TARGET_ALBUM_ID].quantities).toEqual({ MEX1: 2, FWC1: 1 });
    expect(result.recentlyOpenedAlbumIds).toEqual([LEGACY_WC26_TARGET_ALBUM_ID]);
  });

  it("returns an empty library when legacy payload is missing or empty", () => {
    expect(migrateLegacyPayload(null)).toEqual(emptyLibrary());
    expect(migrateLegacyPayload({ quantities: {} })).toEqual(emptyLibrary());
  });

  it("strips invalid or negative quantities silently", () => {
    const r = migrateLegacyPayload({
      quantities: { MEX1: 2, MEX2: -1, MEX3: "garbage" as unknown as number },
    });
    expect(r.albums[LEGACY_WC26_TARGET_ALBUM_ID].quantities).toEqual({ MEX1: 2 });
  });
});

describe("hydrateLibraryFromStorage", () => {
  it("returns an empty library when no payload exists", () => {
    const storage = makeStorageAdapter({});
    const lib = hydrateLibraryFromStorage(storage);
    expect(lib).toEqual(emptyLibrary());
  });

  it("preserves v2 payload unchanged when already migrated", () => {
    const existing = {
      version: LIBRARY_VERSION,
      activeAlbumId: LEGACY_WC26_TARGET_ALBUM_ID,
      recentlyOpenedAlbumIds: [LEGACY_WC26_TARGET_ALBUM_ID],
      albums: {
        [LEGACY_WC26_TARGET_ALBUM_ID]: {
          updatedAt: "2026-03-01T00:00:00.000Z",
          quantities: { MEX1: 2, FWC1: 1 },
        },
      },
    };
    const storage = makeStorageAdapter({
      [LIBRARY_STORAGE_KEY]: JSON.stringify(existing),
    });
    const lib = hydrateLibraryFromStorage(storage);
    expect(lib).toEqual(existing);
  });

  it("migrates legacy WC26 payload, keeps backup, removes original", () => {
    const legacy = {
      version: 1,
      updatedAt: "2026-02-01T00:00:00.000Z",
      quantities: { MEX1: 3, BRA5: 1 },
    };
    const storage = makeStorageAdapter({
      [LEGACY_WC26_STORAGE_KEY]: JSON.stringify(legacy),
    });
    const lib = hydrateLibraryFromStorage(storage);
    expect(lib.activeAlbumId).toBe(LEGACY_WC26_TARGET_ALBUM_ID);
    expect(lib.albums[LEGACY_WC26_TARGET_ALBUM_ID].quantities).toEqual({ MEX1: 3, BRA5: 1 });
    // Backup retained for recovery
    expect(storage.data[`${LEGACY_WC26_STORAGE_KEY}${LEGACY_BACKUP_SUFFIX}`]).toBe(
      JSON.stringify(legacy)
    );
    // Original cleared so subsequent runs do not re-migrate
    expect(storage.data[LEGACY_WC26_STORAGE_KEY]).toBeUndefined();
    // v2 payload written
    expect(storage.data[LIBRARY_STORAGE_KEY]).toBeDefined();
  });

  it("is idempotent — running twice does not duplicate or corrupt data", () => {
    const legacy = { version: 1, quantities: { MEX1: 2 } };
    const storage = makeStorageAdapter({
      [LEGACY_WC26_STORAGE_KEY]: JSON.stringify(legacy),
    });
    const first = hydrateLibraryFromStorage(storage);
    const second = hydrateLibraryFromStorage(storage);
    expect(first).toEqual(second);
  });

  it("never throws on malformed JSON — returns empty library safely", () => {
    const storage = makeStorageAdapter({
      [LIBRARY_STORAGE_KEY]: "{not valid json",
    });
    const lib = hydrateLibraryFromStorage(storage);
    expect(lib).toEqual(emptyLibrary());
  });
});

describe("sanitizeLibrary", () => {
  it("drops invalid albums and unknown fields without throwing", () => {
    const lib = sanitizeLibrary({
      version: 1,
      albums: {
        "panini-world-cup-2026": {
          quantities: { MEX1: 2, BAD: -3 },
        },
        "another-album": {
          quantities: { ABC1: 1 },
        },
        "bad-entry": "garbage",
      },
      recentlyOpenedAlbumIds: ["panini-world-cup-2026", 42],
      activeAlbumId: "panini-world-cup-2026",
      extra: "ignored",
    });
    expect(lib.version).toBe(LIBRARY_VERSION);
    expect(lib.albums["panini-world-cup-2026"].quantities).toEqual({ MEX1: 2 });
    expect(lib.albums["another-album"].quantities).toEqual({ ABC1: 1 });
    expect(lib.albums["bad-entry"]).toBeUndefined();
    expect(lib.recentlyOpenedAlbumIds).toEqual(["panini-world-cup-2026"]);
  });
});
