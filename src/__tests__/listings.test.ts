import { describe, it, expect } from "vitest";
import { viewerMissingSet } from "@/lib/album/listings";
import { ALBUM_STICKERS } from "@/constants/album";

describe("viewerMissingSet", () => {
  it("returns every album code when nothing owned", () => {
    const set = viewerMissingSet({});
    expect(set.size).toBe(ALBUM_STICKERS.length);
    expect(set.has("MEX1")).toBe(true);
    expect(set.has("FWC1")).toBe(true);
    expect(set.has("LOGO")).toBe(true);
  });

  it("excludes codes the user already has at least one of", () => {
    const set = viewerMissingSet({ MEX1: 1, FWC1: 3 });
    expect(set.has("MEX1")).toBe(false);
    expect(set.has("FWC1")).toBe(false);
    expect(set.has("MEX2")).toBe(true);
  });

  it("does not include bonus codes (they are not part of the 980)", () => {
    const set = viewerMissingSet({});
    expect(set.has("BNS1")).toBe(false);
  });
});
