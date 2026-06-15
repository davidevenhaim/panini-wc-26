"use client";

import { type ReactNode } from "react";
import { useInView } from "@/hooks/use-in-view";
import { cn } from "@/lib/utils";

type AppearInProps = {
  children: ReactNode;
  /** Extra CSS classes applied to the wrapper div. */
  className?: string;
  /** Stagger delay in ms — use `index * 75` for cascading grid items. */
  delay?: number;
  /** IntersectionObserver threshold (0–1). Default: 0.12. */
  threshold?: number;
};

/**
 * Wraps children in a fade-up entrance animation that plays once when the
 * element scrolls into view. Uses the existing `useInView` hook internally.
 *
 * @example
 * // Staggered grid
 * {items.map((item, i) => (
 *   <AppearIn key={item.id} delay={i * 75}>
 *     <Card>...</Card>
 *   </AppearIn>
 * ))}
 */
export function AppearIn({ children, className, delay = 0, threshold }: AppearInProps) {
  const { ref, inView } = useInView(threshold);

  return (
    <div
      ref={ref}
      className={cn(
        "transition-all duration-500 ease-out",
        inView ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
        className
      )}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
}
