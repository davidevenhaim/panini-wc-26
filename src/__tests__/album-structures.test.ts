import { describe, it, expect } from "vitest";
import {
  serializeAlbumStructure,
  upsertAlbumStructures,
  fetchAlbumStructureById,
  fetchAlbumStructureByNameKey,
} from "@/lib/album/album-structures";
import { ALBUMS, getAlbumBySlug } from "@/collections/catalog";

describe("album_structures serialization", () => {
  it("maps Album.id → row.id and Album.slug → row.name_key", () => {
    const album = getAlbumBySlug("world-cup-2006")!;
    const row = serializeAlbumStructure(album);
    expect(row.id).toBe("panini-world-cup-2006");
    expect(row.name_key).toBe("world-cup-2006");
    expect(row.version).toBe(1);
    expect(row.structure).toBe(album);
  });

  it("every catalog album has a unique id and unique slug (sanity for table constraints)", () => {
    const ids = new Set<string>();
    const slugs = new Set<string>();
    for (const a of ALBUMS) {
      expect(ids.has(a.id), `duplicate id ${a.id}`).toBe(false);
      expect(slugs.has(a.slug), `duplicate slug ${a.slug}`).toBe(false);
      ids.add(a.id);
      slugs.add(a.slug);
    }
  });

  it("serializes to JSON-safe payloads (no circular refs)", () => {
    for (const a of ALBUMS) {
      const row = serializeAlbumStructure(a);
      expect(() => JSON.stringify(row)).not.toThrow();
    }
  });
});

describe("album_structures supabase calls", () => {
  function makeFakeClient(rows: { id: string; name_key: string }[]) {
    const calls: Record<string, unknown> = {};
    const builder = {
      _table: "",
      from(t: string) {
        this._table = t;
        calls.from = t;
        return this;
      },
      select() {
        calls.select = true;
        return this;
      },
      upsert(payload: unknown, opts: unknown) {
        calls.upsert = payload;
        calls.upsertOpts = opts;
        return this;
      },
      order() {
        return this;
      },
      eq(col: string, val: unknown) {
        calls[`eq:${col}`] = val;
        return this;
      },
      maybeSingle() {
        const id = calls["eq:id"];
        const nameKey = calls["eq:name_key"];
        const row =
          rows.find((r) => r.id === id) ?? rows.find((r) => r.name_key === nameKey) ?? null;
        return Promise.resolve({ data: row, error: null });
      },
      single() {
        return Promise.resolve({
          data: Array.isArray(calls.upsert) ? calls.upsert[0] : calls.upsert,
          error: null,
        });
      },
      then(resolve: (v: { data: unknown; error: null }) => unknown) {
        // Bulk upsert resolves the chain directly.
        return resolve({
          data: Array.isArray(calls.upsert) ? calls.upsert : [calls.upsert],
          error: null,
        });
      },
    };
    return { calls, client: builder };
  }

  it("upsertAlbumStructures hits album_structures with onConflict=id", async () => {
    const album = getAlbumBySlug("world-cup-2006")!;
    const { calls, client } = makeFakeClient([]);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await upsertAlbumStructures(client as any, [album]);
    expect(calls.from).toBe("album_structures");
    expect((calls.upsertOpts as { onConflict?: string }).onConflict).toBe("id");
    const payload = calls.upsert as Array<{ id: string; name_key: string }>;
    expect(payload[0].id).toBe("panini-world-cup-2006");
    expect(payload[0].name_key).toBe("world-cup-2006");
  });

  it("fetchAlbumStructureById queries by id", async () => {
    const { calls, client } = makeFakeClient([
      {
        id: "panini-world-cup-2006",
        name_key: "world-cup-2006",
      },
    ]);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const row = await fetchAlbumStructureById(client as any, "panini-world-cup-2006");
    expect(calls["eq:id"]).toBe("panini-world-cup-2006");
    expect(row?.name_key).toBe("world-cup-2006");
  });

  it("fetchAlbumStructureByNameKey queries by name_key", async () => {
    const { calls, client } = makeFakeClient([
      {
        id: "panini-world-cup-2006",
        name_key: "world-cup-2006",
      },
    ]);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const row = await fetchAlbumStructureByNameKey(client as any, "world-cup-2006");
    expect(calls["eq:name_key"]).toBe("world-cup-2006");
    expect(row?.id).toBe("panini-world-cup-2006");
  });
});
