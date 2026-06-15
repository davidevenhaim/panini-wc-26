"use client";

import { useEffect, useRef, useState } from "react";
import { useInterval } from "@/hooks/use-interval";
import { cn } from "@/lib/utils";

type TypewriterTextProps = {
  phrases: string[];
  /** ms per phrase before fading out. Default: 2800 */
  interval?: number;
  /** ms for the fade transition. Default: 400 */
  fadeDuration?: number;
  className?: string;
};

export function TypewriterText({
  phrases,
  interval = 2800,
  fadeDuration = 400,
  className,
}: TypewriterTextProps) {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(null);

  useInterval(() => {
    setVisible(false);
    timeoutRef.current = setTimeout(() => {
      setIndex((i) => (i + 1) % phrases.length);
      setVisible(true);
    }, fadeDuration);
  }, interval);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <span
      className={cn("transition-opacity", className)}
      style={{ transitionDuration: `${fadeDuration}ms`, opacity: visible ? 1 : 0 }}
    >
      {phrases[index]}
    </span>
  );
}
