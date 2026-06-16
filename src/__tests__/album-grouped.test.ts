import { describe, it, expect } from "vitest";
import { groupDuplicatesByTeam, groupMissingByTeam } from "@/lib/album/grouped";
import { TEAMS } from "@/constants/album";

describe("grouped", () => {
  it("groups missing by team and skips empty buckets", () => {
    const q: Record<string, number> = {};
    // Fully own Mexico, leave others alone
    for (const s of TEAMS[0].stickers) q[s.code] = 1;
    const missing = groupMissingByTeam(q);
    const codes = missing.map((b) => b.id);
    expect(codes).not.toContain(TEAMS[0].code); // Mexico is full → no bucket
    expect(codes).toContain(TEAMS[1].code); // RSA still missing
  });

  it("groups duplicates with counts", () => {
    const dup = groupDuplicatesByTeam({ MEX1: 3, MEX2: 2, MEX3: 1 });
    const mexBucket = dup.find((b) => b.id === "MEX");
    expect(mexBucket).toBeTruthy();
    expect(mexBucket?.codes).toEqual(["MEX1", "MEX2"]);
    expect(mexBucket?.counts).toEqual({ MEX1: 2, MEX2: 1 });
  });

  it("orders buckets album-style: logo → opening FWC → teams → closing FWC → bonus", () => {
    const q: Record<string, number> = {
      LOGO: 2,
      FWC1: 2,
      MEX1: 2,
      FWC9: 2,
      BNS1: 2,
    };
    const dup = groupDuplicatesByTeam(q);
    const ids = dup.map((b) => b.id);
    expect(ids).toEqual(["panini-logo", "fwc-opening", "MEX", "fwc-closing", "bonus-coca-cola"]);
  });
});
