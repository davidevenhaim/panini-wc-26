"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

function subscribeReducedMotion(callback: () => void) {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", callback);
  return () => mq.removeEventListener("change", callback);
}

function getReducedMotionSnapshot() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function getReducedMotionServerSnapshot() {
  return false;
}

function sleep(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

export type RotatingTypewriterTextProps = {
  phrases: string[];
  /** ms between characters while typing. Default: 52 */
  typeSpeedMs?: number;
  /** ms between characters while deleting. Default: 28 */
  deleteSpeedMs?: number;
  /** ms to hold the full phrase before deleting. Default: 2200 */
  holdMs?: number;
  className?: string;
  /** Reserve width for the longest phrase to limit layout shift */
  stabilizeWidth?: boolean;
};

/**
 * Cycles through `phrases` with a typewriter effect (type on, hold, delete).
 * Respects `prefers-reduced-motion` by showing the first phrase statically.
 */
export function RotatingTypewriterText({
  phrases,
  typeSpeedMs = 52,
  deleteSpeedMs = 28,
  holdMs = 2200,
  className,
  stabilizeWidth = true,
}: RotatingTypewriterTextProps) {
  const reducedMotion = React.useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot
  );

  const [phraseIndex, setPhraseIndex] = React.useState(0);
  const [visibleSlice, setVisibleSlice] = React.useState("");

  const longestGhost = React.useMemo(
    () =>
      phrases.length > 0
        ? phrases.reduce((a, b) => (a.length >= b.length ? a : b), phrases[0])
        : "",
    [phrases]
  );

  React.useEffect(() => {
    if (phrases.length === 0) {
      setVisibleSlice("");
      return;
    }

    if (reducedMotion) {
      setVisibleSlice(phrases[0]);
      return;
    }

    let cancelled = false;

    async function runPhrase(i: number) {
      const phrase = phrases[i % phrases.length];
      for (let len = 0; len <= phrase.length; len += 1) {
        if (cancelled) return;
        setVisibleSlice(phrase.slice(0, len));
        await sleep(typeSpeedMs);
      }
      await sleep(holdMs);
      for (let len = phrase.length; len >= 0; len -= 1) {
        if (cancelled) return;
        setVisibleSlice(phrase.slice(0, len));
        await sleep(deleteSpeedMs);
      }
      if (!cancelled) {
        setPhraseIndex((p) => (p + 1) % phrases.length);
      }
    }

    void runPhrase(phraseIndex);

    return () => {
      cancelled = true;
    };
  }, [phraseIndex, phrases, reducedMotion, typeSpeedMs, deleteSpeedMs, holdMs]);

  if (phrases.length === 0) {
    return null;
  }

  const content = (
    <>
      {visibleSlice}
      <span
        className="border-primary ms-0.5 inline-block min-h-[0.85em] w-px animate-pulse align-baseline"
        aria-hidden
      />
    </>
  );

  return (
    <span className={cn("inline align-baseline", className)} aria-live="polite" aria-atomic="true">
      {stabilizeWidth && longestGhost ? (
        <span className="inline-grid align-baseline">
          <span className="invisible col-start-1 row-start-1" aria-hidden>
            {longestGhost}
          </span>
          <span className="col-start-1 row-start-1">{content}</span>
        </span>
      ) : (
        content
      )}
    </span>
  );
}
