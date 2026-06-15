"use client";

import Image from "next/image";
import type { ReactNode } from "react";
import { useThemeStore } from "@/store/theme.store";
import { cn } from "@/lib/utils";

export type HeroWithBackgroundImageProps = {
  /**
   * Image URL or path (default / dark theme). Use a path under `public/` or an
   * absolute URL (`https://…`). Remote URLs use `unoptimized`.
   */
  backgroundImageSrc: string;
  /**
   * Optional separate asset for light theme. When omitted, `backgroundImageSrc`
   * is used for both themes.
   */
  backgroundImageSrcLight?: string;
  /** Alt text; use `""` for decorative backgrounds */
  backgroundImageAlt?: string;
  /** Opacity of the photo layer only (0–1). Default: 0.42 */
  backgroundOpacity?: number;
  /** Tint over the image for text contrast. Default: theme background at ~55–65%. */
  overlayClassName?: string;
  /** `object-position` for `object-cover` (e.g. `center bottom`). */
  imagePosition?: string;
  children: ReactNode;
  className?: string;
  /** Applied to the foreground wrapper around `children` */
  contentClassName?: string;
  /** Set false if this hero is below the fold */
  priority?: boolean;
};

function isRemoteImage(src: string) {
  return /^https?:\/\//i.test(src);
}

/**
 * Full-viewport hero section with a cover background image, optional tint, and
 * stacked foreground content.
 */
export function HeroWithBackgroundImage({
  backgroundImageSrc,
  backgroundImageSrcLight,
  backgroundImageAlt = "",
  backgroundOpacity = 0.42,
  overlayClassName = "bg-background/5 dark:bg-background/60",
  imagePosition = "center bottom",
  children,
  className,
  contentClassName,
  priority = true,
}: HeroWithBackgroundImageProps) {
  const theme = useThemeStore((s) => s.theme);
  const resolvedSrc =
    backgroundImageSrcLight && theme === "light" ? backgroundImageSrcLight : backgroundImageSrc;
  const remote = isRemoteImage(resolvedSrc);

  return (
    <section
      className={cn(
        "relative flex min-h-svh items-center justify-center overflow-hidden px-6 py-24 text-center",
        className
      )}
    >
      <div className="absolute inset-0 z-0" aria-hidden>
        <Image
          key={resolvedSrc}
          src={resolvedSrc}
          alt={backgroundImageAlt}
          fill
          priority={priority}
          sizes="100vw"
          className="object-cover"
          style={{ objectPosition: imagePosition, opacity: backgroundOpacity }}
          unoptimized={remote}
        />
        <div className={cn("pointer-events-none absolute inset-0", overlayClassName)} />
      </div>
      <div className={cn("relative z-10 w-full", contentClassName)}>{children}</div>
    </section>
  );
}
