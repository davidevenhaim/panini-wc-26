import { clampQuantity, type Quantities } from "@/lib/album/collection";

/**
 * Multi-album, versioned persisted state.
 *
 * Previous single-album shape (v1):
 *   { version: 1, updatedAt: string, quantities: Record<string, number> }
 *   localStorage key: "panini-wc26-collection"
 *
 * New shape (v2):
 *   localStorage key: "panini-collection-library"
 */
export const LIBRARY_STORAGE_KEY = "panini-collection-library";
export const LIBRARY_VERSION = 2;

/** Legacy v1 single-album storage key. */
export const LEGACY_WC26_STORAGE_KEY = "panini-wc26-collection";

/** Suffix used when stashing a recoverable backup of the previous payload. */
export const LEGACY_BACKUP_SUFFIX = ".backup-v1";

/** Album id that the legacy WC26 quantities migrate into. */
export const LEGACY_WC26_TARGET_ALBUM_ID = "panini-world-cup-2026";

export type PersistedAlbumState = {
  updatedAt: string;
  quantities: Quantities;
};

export type PersistedCollectionLibrary = {
  version: number;
  activeAlbumId?: string;
  recentlyOpenedAlbumIds: string[];
  albums: Record<string, PersistedAlbumState>;
};

export function emptyLibrary(): PersistedCollectionLibrary {
  return {
    version: LIBRARY_VERSION,
    recentlyOpenedAlbumIds: [],
    albums: {},
  };
}

function isQuantitiesObject(input: unknown): input is Record<string, unknown> {
  return !!input && typeof input === "object" && !Array.isArray(input);
}

function sanitizeQuantities(input: unknown): Quantities {
  const result: Quantities = {};
  if (!isQuantitiesObject(input)) return result;
  for (const [code, value] of Object.entries(input)) {
    const safe = clampQuantity(typeof value === "number" ? value : Number(value));
    if (safe > 0) result[code] = safe;
  }
  return result;
}

/**
 * Coerce any raw library payload (potentially from a stale version or
 * tampered storage) into a clean v2 shape. Never throws — invalid data is
 * dropped, not allowed to crash the app.
 */
export function sanitizeLibrary(input: unknown): PersistedCollectionLibrary {
  if (!input || typeof input !== "object") return emptyLibrary();
  const obj = input as Record<string, unknown>;
  const albumsRaw = obj.albums;
  const albums: Record<string, PersistedAlbumState> = {};
  if (isQuantitiesObject(albumsRaw)) {
    for (const [id, entry] of Object.entries(albumsRaw)) {
      if (!isQuantitiesObject(entry)) continue;
      albums[id] = {
        updatedAt: typeof entry.updatedAt === "string" ? entry.updatedAt : new Date().toISOString(),
        quantities: sanitizeQuantities(entry.quantities),
      };
    }
  }
  const recently = Array.isArray(obj.recentlyOpenedAlbumIds)
    ? obj.recentlyOpenedAlbumIds.filter((v): v is string => typeof v === "string")
    : [];
  return {
    version: LIBRARY_VERSION,
    activeAlbumId: typeof obj.activeAlbumId === "string" ? obj.activeAlbumId : undefined,
    recentlyOpenedAlbumIds: recently,
    albums,
  };
}

/**
 * Detect a v1 single-album payload (the original WC26 shape) and convert it
 * into the v2 library shape under the canonical WC26 album id.
 */
export function migrateLegacyPayload(legacy: unknown): PersistedCollectionLibrary {
  if (!legacy || typeof legacy !== "object") return emptyLibrary();
  const obj = legacy as Record<string, unknown>;
  const quantitiesRaw = "quantities" in obj ? obj.quantities : obj;
  const quantities = sanitizeQuantities(quantitiesRaw);
  if (Object.keys(quantities).length === 0) return emptyLibrary();
  return {
    version: LIBRARY_VERSION,
    activeAlbumId: LEGACY_WC26_TARGET_ALBUM_ID,
    recentlyOpenedAlbumIds: [LEGACY_WC26_TARGET_ALBUM_ID],
    albums: {
      [LEGACY_WC26_TARGET_ALBUM_ID]: {
        updatedAt: typeof obj.updatedAt === "string" ? obj.updatedAt : new Date().toISOString(),
        quantities,
      },
    },
  };
}

type ReadOptions = {
  read: (key: string) => string | null;
  write: (key: string, value: string) => void;
  remove: (key: string) => void;
};

/**
 * Hydrate the library from a storage adapter, running the legacy → v2
 * migration when needed. Idempotent — running it again after a successful
 * migration is a no-op.
 *
 * - If v2 payload exists → parse + sanitize, return as-is.
 * - Else if v1 (legacy WC26) payload exists → migrate to v2, write v2,
 *   keep the legacy payload as `<key>.backup-v1` for recovery, then clear
 *   the original legacy key.
 * - Else → return an empty library.
 */
export function hydrateLibraryFromStorage(opts: ReadOptions): PersistedCollectionLibrary {
  const v2Raw = opts.read(LIBRARY_STORAGE_KEY);
  if (v2Raw) {
    try {
      return sanitizeLibrary(JSON.parse(v2Raw));
    } catch {
      return emptyLibrary();
    }
  }

  const legacyRaw = opts.read(LEGACY_WC26_STORAGE_KEY);
  if (!legacyRaw) return emptyLibrary();

  let parsed: unknown = null;
  try {
    parsed = JSON.parse(legacyRaw);
  } catch {
    return emptyLibrary();
  }

  const migrated = migrateLegacyPayload(parsed);
  // Backup before clearing
  opts.write(`${LEGACY_WC26_STORAGE_KEY}${LEGACY_BACKUP_SUFFIX}`, legacyRaw);
  opts.write(LIBRARY_STORAGE_KEY, JSON.stringify(migrated));
  opts.remove(LEGACY_WC26_STORAGE_KEY);
  return migrated;
}

export function writeLibraryToStorage(
  library: PersistedCollectionLibrary,
  opts: Pick<ReadOptions, "write">
) {
  opts.write(LIBRARY_STORAGE_KEY, JSON.stringify(library));
}
