import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useLocalStorage } from "@/hooks/use-local-storage";

describe("useLocalStorage", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("restores falsy boolean false from storage", async () => {
    window.localStorage.setItem("flag", JSON.stringify(false));

    const { result } = renderHook(() => useLocalStorage("flag", true));

    await waitFor(() => {
      expect(result.current.state).toBe(false);
    });
  });

  it("restores zero from storage", async () => {
    window.localStorage.setItem("count", JSON.stringify(0));

    const { result } = renderHook(() => useLocalStorage("count", 1));

    await waitFor(() => {
      expect(result.current.state).toBe(0);
    });
  });
});
