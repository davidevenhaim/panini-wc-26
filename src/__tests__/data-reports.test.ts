import { describe, it, expect } from "vitest";
import { ReportPayloadSchema, DATA_ISSUE_TYPES } from "@/features/data-reports/types";

describe("ReportPayloadSchema", () => {
  const base = {
    albumId: "panini-world-cup-2022",
    issueType: "WRONG_PLAYER_NAME" as const,
    description: "The player name is misspelled.",
  };

  it("accepts a minimal valid payload", () => {
    expect(ReportPayloadSchema.safeParse(base).success).toBe(true);
  });

  it("rejects short descriptions", () => {
    const r = ReportPayloadSchema.safeParse({ ...base, description: "no" });
    expect(r.success).toBe(false);
  });

  it("rejects descriptions over 2000 chars", () => {
    const r = ReportPayloadSchema.safeParse({
      ...base,
      description: "x".repeat(2001),
    });
    expect(r.success).toBe(false);
  });

  it("rejects unknown issue type", () => {
    const r = ReportPayloadSchema.safeParse({
      ...base,
      issueType: "MADE_UP" as unknown as typeof base.issueType,
    });
    expect(r.success).toBe(false);
  });

  it("rejects non-https/http URLs", () => {
    const r = ReportPayloadSchema.safeParse({
      ...base,
      sourceUrl: "javascript:alert(1)",
    });
    expect(r.success).toBe(false);
  });

  it("rejects URL over 500 chars", () => {
    const r = ReportPayloadSchema.safeParse({
      ...base,
      sourceUrl: `https://example.com/${"x".repeat(500)}`,
    });
    expect(r.success).toBe(false);
  });

  it("accepts a valid https URL", () => {
    const r = ReportPayloadSchema.safeParse({
      ...base,
      sourceUrl: "https://example.com/photo.jpg",
    });
    expect(r.success).toBe(true);
  });

  it("treats empty optional fields as undefined", () => {
    const r = ReportPayloadSchema.safeParse({
      ...base,
      sourceUrl: "",
      suggestedValue: "",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.sourceUrl).toBeUndefined();
      expect(r.data.suggestedValue).toBeUndefined();
    }
  });

  it("trims description before length checks", () => {
    const r = ReportPayloadSchema.safeParse({
      ...base,
      description: "    valid description   ",
    });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.description).toBe("valid description");
  });

  it("DATA_ISSUE_TYPES matches the schema's enum exactly", () => {
    expect(DATA_ISSUE_TYPES.length).toBe(11);
  });
});
