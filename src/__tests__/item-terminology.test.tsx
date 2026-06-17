import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import en from "../../messages/en.json";
import he from "../../messages/he.json";
import { useItemTerminology } from "@/features/album/use-item-terminology";

function wrap(locale: "en" | "he", messages: Record<string, unknown>) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <NextIntlClientProvider locale={locale} messages={messages as never}>
        {children}
      </NextIntlClientProvider>
    );
  };
}

describe("useItemTerminology", () => {
  it("returns sticker vocabulary for STICKER albums (English)", () => {
    const { result } = renderHook(() => useItemTerminology({ itemType: "STICKER" }), {
      wrapper: wrap("en", en),
    });
    expect(result.current.singular).toBe("sticker");
    expect(result.current.plural).toBe("stickers");
    expect(result.current.missingTitle).toBe("Missing stickers");
  });

  it("returns card vocabulary for CARD albums (English)", () => {
    const { result } = renderHook(() => useItemTerminology({ itemType: "CARD" }), {
      wrapper: wrap("en", en),
    });
    expect(result.current.singular).toBe("card");
    expect(result.current.plural).toBe("cards");
    expect(result.current.missingTitle).toBe("Missing cards");
    expect(result.current.markSectionComplete).toBe("Mark series complete");
  });

  it("returns Hebrew קלפים for CARD albums", () => {
    const { result } = renderHook(() => useItemTerminology({ itemType: "CARD" }), {
      wrapper: wrap("he", he),
    });
    expect(result.current.plural).toBe("קלפים");
    expect(result.current.missingTitle).toBe("קלפים חסרים");
    expect(result.current.duplicatesTitle).toBe("קלפים כפולים");
    expect(result.current.markSectionComplete).toBe("סמן סדרה כמלאה");
  });
});
