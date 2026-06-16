import { describe, it, expect } from "vitest";
import { contactHref, contactHrefWithText, supportsPrefill } from "@/lib/album/contact";

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

describe("contactHrefWithText", () => {
  it("prefills whatsapp text", () => {
    const href = contactHrefWithText("whatsapp", "+972 50 1234567", "Hi!");
    expect(href).toBe("https://wa.me/972501234567?text=Hi!");
  });

  it("prefills mailto subject + body", () => {
    const href = contactHrefWithText("email", "a@b.com", "Body", "Subject");
    expect(href).toBe("mailto:a@b.com?subject=Subject&body=Body");
  });

  it("prefills sms body for phone", () => {
    const href = contactHrefWithText("phone", "+12345", "yo");
    expect(href).toBe("sms:+12345?body=yo");
  });

  it("falls back to plain telegram URL (no prefill)", () => {
    expect(contactHrefWithText("telegram", "@d", "msg")).toBe("https://t.me/d");
  });

  it("encodes line breaks + special chars", () => {
    const href = contactHrefWithText("whatsapp", "+1", "line1\nline2 & more");
    expect(href).toContain("line1%0Aline2%20%26%20more");
  });
});

describe("supportsPrefill", () => {
  it("returns true for whatsapp, email, phone", () => {
    expect(supportsPrefill("whatsapp")).toBe(true);
    expect(supportsPrefill("email")).toBe(true);
    expect(supportsPrefill("phone")).toBe(true);
  });
  it("returns false for telegram, instagram, none, null", () => {
    expect(supportsPrefill("telegram")).toBe(false);
    expect(supportsPrefill("instagram")).toBe(false);
    expect(supportsPrefill("none")).toBe(false);
    expect(supportsPrefill(null)).toBe(false);
  });
});
