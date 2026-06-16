import { describe, it, expect } from "vitest";
import { contactHref } from "@/lib/album/contact";

describe("contactHref", () => {
  it("returns null for missing/empty/none", () => {
    expect(contactHref(null, null)).toBe(null);
    expect(contactHref("none", "+972")).toBe(null);
    expect(contactHref("whatsapp", "")).toBe(null);
  });

  it("builds whatsapp link with digits-only", () => {
    expect(contactHref("whatsapp", "+972-50-123-4567")).toBe("https://wa.me/972501234567");
  });

  it("builds telegram link stripping leading @", () => {
    expect(contactHref("telegram", "@david")).toBe("https://t.me/david");
    expect(contactHref("telegram", "david")).toBe("https://t.me/david");
  });

  it("builds mailto", () => {
    expect(contactHref("email", "a@b.com")).toBe("mailto:a@b.com");
  });

  it("builds phone link preserving leading +", () => {
    expect(contactHref("phone", "+972 50 123 4567")).toBe("tel:+972501234567");
  });

  it("builds instagram link", () => {
    expect(contactHref("instagram", "@user")).toBe("https://instagram.com/user");
  });
});
