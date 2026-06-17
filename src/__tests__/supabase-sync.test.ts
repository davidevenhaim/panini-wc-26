import { describe, it, expect } from "vitest";
import {
  DEFAULT_SYNC_ALBUM_ID,
  fetchUserStickers,
  pushUserStickers,
  replaceUserStickers,
} from "@/lib/album/supabase-sync";

type CallRecord = {
  table: string;
  op: string;
  args: unknown[];
  eqs: Record<string, unknown>;
  ins?: Record<string, unknown>;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Chain = any;

function makeMockClient() {
  const calls: CallRecord[] = [];

  function builderFor(table: string, op: string, initialArgs: unknown[]): Chain {
    const state: CallRecord = {
      table,
      op,
      args: initialArgs,
      eqs: {},
      ins: undefined,
    };
    const chain: Chain = {
      select: (...a: unknown[]) => {
        state.args.push(...a);
        return chain;
      },
      eq: (k: string, v: unknown) => {
        state.eqs[k] = v;
        return chain;
      },
      in: (k: string, v: unknown) => {
        state.ins = { [k]: v };
        return chain;
      },
      upsert: (...a: unknown[]) => {
        state.args.push(...a);
        return chain;
      },
      insert: (...a: unknown[]) => {
        state.args.push(...a);
        return chain;
      },
      delete: () => {
        state.op = "delete";
        return chain;
      },
      then: (resolve: (v: unknown) => void) => {
        calls.push(state);
        resolve({ data: [], error: null });
      },
    };
    return chain;
  }

  const supabase = {
    from(table: string) {
      return {
        select: (...a: unknown[]) => builderFor(table, "select", a),
        upsert: (...a: unknown[]) => builderFor(table, "upsert", a),
        insert: (...a: unknown[]) => builderFor(table, "insert", a),
        delete: () => builderFor(table, "delete", []),
      };
    },
  };

  return { supabase, calls };
}

describe("supabase-sync — album_id wiring", () => {
  it("DEFAULT_SYNC_ALBUM_ID is the legacy WC26 id", () => {
    expect(DEFAULT_SYNC_ALBUM_ID).toBe("panini-world-cup-2026");
  });

  it("fetchUserStickers filters by album_id", async () => {
    const { supabase, calls } = makeMockClient();
    // mock the chain to call .then properly
    const result = await fetchUserStickers(supabase as never, "user-1", "israel-2025");
    expect(result).toEqual({});
    expect(calls[0].table).toBe("user_stickers");
    expect(calls[0].eqs).toEqual({ user_id: "user-1", album_id: "israel-2025" });
  });

  it("pushUserStickers upserts with album_id", async () => {
    const { supabase, calls } = makeMockClient();
    await pushUserStickers(supabase as never, "u", [{ code: "X-1", quantity: 2 }], "israel-2025");
    expect(calls[0].args[0]).toEqual([
      { user_id: "u", album_id: "israel-2025", code: "X-1", quantity: 2 },
    ]);
  });

  it("replaceUserStickers scopes delete to album_id and inserts album_id", async () => {
    const { supabase, calls } = makeMockClient();
    await replaceUserStickers(supabase as never, "u", { "X-1": 1 }, "israel-2025");
    expect(calls[0].op).toBe("delete");
    expect(calls[0].eqs).toEqual({ user_id: "u", album_id: "israel-2025" });
    expect(calls[1].args[0]).toEqual([
      { user_id: "u", album_id: "israel-2025", code: "X-1", quantity: 1 },
    ]);
  });
});

describe("supabase-sync — defaults remain WC26", () => {
  it("fetchUserStickers without albumId uses default", async () => {
    const { supabase, calls } = makeMockClient();
    await fetchUserStickers(supabase as never, "u");
    expect(calls[0].eqs.album_id).toBe(DEFAULT_SYNC_ALBUM_ID);
  });
});
