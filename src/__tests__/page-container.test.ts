import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("PageContainer", () => {
  it("does not import demo layout actions", () => {
    const source = readFileSync(
      resolve(process.cwd(), "src/components/app/page-container.tsx"),
      "utf8"
    );
    expect(source).not.toContain("demo/layout/actions");
    expect(source).toContain("actions?:");
  });
});
