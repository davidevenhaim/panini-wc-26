"use client";

import * as React from "react";
import { useInView } from "@/hooks/use-in-view";
import { cn } from "@/lib/utils";

type FadeInProps = {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "left" | "right" | "none";
};

const hiddenByDirection = {
  up: "translate-y-8 opacity-0",
  left: "translate-x-8 opacity-0",
  right: "-translate-x-8 opacity-0",
  none: "opacity-0",
} as const;

const visibleClasses = "translate-x-0 translate-y-0 opacity-100";

function FadeIn({ children, className, delay = 0, direction = "up" }: FadeInProps) {
  const { ref, inView } = useInView();

  return (
    <div
      ref={ref}
      className={cn(
        "transform-gpu transition-[opacity,transform] duration-700 ease-out",
        inView ? visibleClasses : hiddenByDirection[direction],
        className
      )}
      style={{ transitionDelay: inView ? `${delay}ms` : "0ms" }}
    >
      {children}
    </div>
  );
}

/** Re-runs fade-in when `changeKey` changes (e.g. stepper panels). */
export function FadeInOnChange({
  changeKey,
  children,
  className,
  delay = 0,
  direction = "up",
}: FadeInProps & { changeKey: string | number }) {
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    setVisible(false);
    const id = window.requestAnimationFrame(() => {
      const id2 = window.requestAnimationFrame(() => setVisible(true));
      return () => window.cancelAnimationFrame(id2);
    });
    return () => window.cancelAnimationFrame(id);
  }, [changeKey]);

  return (
    <div
      className={cn(
        "transform-gpu transition-[opacity,transform] duration-700 ease-out",
        visible ? visibleClasses : hiddenByDirection[direction],
        className
      )}
      style={{ transitionDelay: visible ? `${delay}ms` : "0ms" }}
    >
      {children}
    </div>
  );
}

export default FadeIn;
