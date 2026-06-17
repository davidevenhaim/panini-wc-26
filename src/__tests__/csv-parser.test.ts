import { describe, it, expect } from "vitest";
import { parseCsv, rowsToObjects } from "@/lib/album/csv";

describe("parseCsv", () => {
  it("parses a basic CSV with header", () => {
    const rows = parseCsv("a,b,c\n1,2,3\n");
    expect(rows).toEqual([
      ["a", "b", "c"],
      ["1", "2", "3"],
    ]);
  });

  it("handles CRLF line endings", () => {
    const rows = parseCsv("a,b\r\n1,2\r\n3,4");
    expect(rows).toEqual([
      ["a", "b"],
      ["1", "2"],
      ["3", "4"],
    ]);
  });

  it("handles quoted cells with commas and quotes", () => {
    const rows = parseCsv(`a,b\n"hello, world","quote ""inside"""`);
    expect(rows[1]).toEqual(["hello, world", `quote "inside"`]);
  });

  it("strips UTF-8 BOM", () => {
    const withBom = "﻿a,b\n1,2";
    const rows = parseCsv(withBom);
    expect(rows[0]).toEqual(["a", "b"]);
  });

  it("skips fully empty lines", () => {
    const rows = parseCsv("a,b\n1,2\n\n\n3,4\n");
    expect(rows).toHaveLength(3);
  });

  it("preserves Hebrew text", () => {
    const rows = parseCsv("name,he\nMaccabi,מכבי\n");
    expect(rows[1]).toEqual(["Maccabi", "מכבי"]);
  });
});

describe("rowsToObjects", () => {
  it("returns objects keyed by trimmed headers", () => {
    const rows = parseCsv(" code , quantity \nA-1,3\n");
    const objs = rowsToObjects(rows);
    expect(objs).toEqual([{ code: "A-1", quantity: "3" }]);
  });

  it("missing trailing columns become empty strings", () => {
    const rows = parseCsv("a,b,c\n1,2");
    const objs = rowsToObjects(rows);
    expect(objs).toEqual([{ a: "1", b: "2", c: "" }]);
  });
});
