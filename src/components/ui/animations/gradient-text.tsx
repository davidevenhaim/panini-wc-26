"use client";

import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type GradientTextProps = {
  children: ReactNode;
  className?: string;
};

export function GradientText({ children, className }: GradientTextProps) {
  return (
    <>
      <style>{`
        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
      `}</style>
      <span
        className={cn("inline bg-clip-text text-transparent", className)}
        style={{
          backgroundImage: "linear-gradient(90deg, #6366f1, #8b5cf6, #06b6d4, #6366f1)",
          backgroundSize: "200% auto",
          animation: "gradient-shift 4s ease infinite",
        }}
      >
        {children}
      </span>
    </>
  );
}
