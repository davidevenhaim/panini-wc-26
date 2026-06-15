import * as React from "react";
import { Typography } from "@/components/ui/typography";
import { cn } from "@/lib/utils";

// ----------------------------------------------------------------------

export type PageContainerProps = {
  /** Page title text */
  title?: React.ReactNode;
  /** Optional subtitle or breadcrumb below the title */
  subtitle?: React.ReactNode;
  /** Optional header actions (e.g. theme toggle, locale picker) */
  actions?: React.ReactNode;
  /** Page body content */
  children: React.ReactNode;
  className?: string;
  /** Max-width class (default: "max-w-7xl") */
  maxWidth?: string;
};

/**
 * Standard page layout wrapper with title, subtitle, actions, and content.
 */
export function PageContainer({
  title,
  subtitle,
  actions,
  children,
  className,
  maxWidth,
}: PageContainerProps) {
  return (
    <div className={cn("mx-auto w-full py-8", maxWidth, className)}>
      <div className="mx-auto mb-6 flex max-w-7xl items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          {title && (
            <Typography
              variant="subtitle1"
              as="h1"
              className="text-foreground text-2xl font-bold tracking-tight"
            >
              {title}
            </Typography>
          )}
          {subtitle && (
            <Typography variant="caption2" as="p" color="muted">
              {subtitle}
            </Typography>
          )}
        </div>
        {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
      </div>
      {children}
    </div>
  );
}
