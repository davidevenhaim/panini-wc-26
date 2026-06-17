"use client";

import { useState, useCallback } from "react";

// ----------------------------------------------------------------------

export type UseCopyToClipboardReturn = {
  copy: (text: string) => Promise<boolean>;
  copied: boolean;
};

/**
 * Copies text to the clipboard and exposes a `copied` flag that
 * auto-resets after `resetMs` milliseconds (default 2000 ms).
 *
 * @example
 * const { copy, copied } = useCopyToClipboard();
 * <Button onClick={() => copy(value)}>
 *   {copied ? "Copied!" : "Copy"}
 * </Button>
 */
export function useCopyToClipboard(resetMs = 2000): UseCopyToClipboardReturn {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(
    async (text: string) => {
      try {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), resetMs);
        return true;
      } catch {
        console.error("useCopyToClipboard: clipboard write failed");
        return false;
      }
    },
    [resetMs]
  );

  return { copy, copied };
}
