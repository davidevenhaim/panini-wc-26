"use client";

import { useRef } from "react";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type SpotlightCardProps = {
  children: ReactNode;
  className?: string;
  /** Radial gradient color at the cursor position. Default: indigo at 16% opacity */
  spotlightColor?: string;
};

export function SpotlightCard({
  children,
  className,
  spotlightColor = "rgba(99, 102, 241, 0.16)",
}: SpotlightCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const spotlightRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect || !spotlightRef.current) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    spotlightRef.current.style.background = `radial-gradient(circle 180px at ${x}px ${y}px, ${spotlightColor}, transparent 80%)`;
  };

  const handleMouseLeave = () => {
    if (spotlightRef.current) spotlightRef.current.style.background = "transparent";
  };

  return (
    <div
      ref={cardRef}
      className={cn("relative overflow-hidden", className)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div ref={spotlightRef} className="pointer-events-none absolute inset-0 rounded-[inherit]" />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
