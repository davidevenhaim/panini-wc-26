"use client";

import * as React from "react";
import { useDirection } from "@/components/app/direction-provider";
import { Button } from "@/components/ui/button";
import Iconify from "@/components/ui/iconify";
import { cn } from "@/lib/utils";

type NavState = {
  hasPrev: boolean;
  hasNext: boolean;
  goPrev: () => void;
  goNext: () => void;
};

type UseDialogSectionNavOptions<T> = {
  open: boolean;
  items: T[];
  currentIndex: number;
  onSelect?: (item: T) => void;
};

export function useDialogSectionNav<T>({
  open,
  items,
  currentIndex,
  onSelect,
}: UseDialogSectionNavOptions<T>): NavState & { canNavigate: boolean } {
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex >= 0 && currentIndex < items.length - 1;
  const canNavigate = items.length > 1 && Boolean(onSelect);

  const goPrev = React.useCallback(() => {
    if (!hasPrev || !onSelect) return;
    onSelect(items[currentIndex - 1]!);
  }, [currentIndex, hasPrev, items, onSelect]);

  const goNext = React.useCallback(() => {
    if (!hasNext || !onSelect) return;
    onSelect(items[currentIndex + 1]!);
  }, [currentIndex, hasNext, items, onSelect]);

  const isRtl = useDirection() === "rtl";

  React.useEffect(() => {
    if (!open || !canNavigate) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        if (isRtl) goNext();
        else goPrev();
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        if (isRtl) goPrev();
        else goNext();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, canNavigate, goPrev, goNext, isRtl]);

  return { hasPrev, hasNext, goPrev, goNext, canNavigate };
}

type SideNavProps = NavState & {
  enabled: boolean;
  prevLabel: string;
  nextLabel: string;
};

/** Marker attribute used by parent dialogs to prevent close-on-outside-click. */
export const DIALOG_SIDE_NAV_ATTR = "data-dialog-side-nav";

/** Pass to `onInteractOutside` on `DialogContent` so clicks on a side-nav button
 *  don't close the dialog (they render in the portal but outside the panel). */
export function preventDialogCloseOnSideNav(event: Event) {
  const customEvent = event as CustomEvent<{ originalEvent: Event }>;
  const target =
    (customEvent.detail?.originalEvent?.target as Element | null) ??
    (event.target as Element | null);
  if (target?.closest(`[${DIALOG_SIDE_NAV_ATTR}]`)) {
    event.preventDefault();
  }
}

function NavButton({
  chevron,
  disabled,
  onClick,
  label,
  className,
  size = "icon",
}: {
  chevron: "left" | "right";
  disabled: boolean;
  onClick: () => void;
  label: string;
  className?: string;
  size?: "icon" | "icon-sm";
}) {
  // Use aria-disabled (not disabled) so the button keeps pointer-events. With
  // pointer-events:none, a click on a disabled side nav lands on the dialog
  // overlay underneath and closes the dialog.
  return (
    <Button
      type="button"
      variant="outline"
      size={size}
      {...{ [DIALOG_SIDE_NAV_ATTR]: "" }}
      className={cn(
        "bg-background/95 shrink-0 rounded-full shadow-md backdrop-blur-sm",
        size === "icon" ? "size-10" : undefined,
        disabled && "cursor-not-allowed opacity-40",
        className
      )}
      aria-disabled={disabled}
      onClick={(event) => {
        event.stopPropagation();
        if (!disabled) onClick();
      }}
      aria-label={label}
    >
      <Iconify
        icon={chevron === "left" ? "lucide:chevron-left" : "lucide:chevron-right"}
        className={size === "icon" ? "size-5" : "size-4"}
        flipRtl={false}
      />
    </Button>
  );
}

const DESKTOP_SIDE_CLASS =
  "fixed top-1/2 z-[60] hidden -translate-y-1/2 sm:inline-flex pointer-events-auto";
const DESKTOP_LEFT_CLASS = `${DESKTOP_SIDE_CLASS} left-[max(0.75rem,calc(50%-min(21rem,50vw-1rem)-3rem))]`;
const DESKTOP_RIGHT_CLASS = `${DESKTOP_SIDE_CLASS} right-[max(0.75rem,calc(50%-min(21rem,50vw-1rem)-3rem))]`;

function getSideNavSlots(
  isRtl: boolean,
  { hasPrev, hasNext, goPrev, goNext, prevLabel, nextLabel }: SideNavProps
) {
  // LTR: prev on the left, next on the right. RTL: next on the left, prev on the right.
  const left = isRtl
    ? { disabled: !hasNext, onClick: goNext, label: nextLabel }
    : { disabled: !hasPrev, onClick: goPrev, label: prevLabel };
  const right = isRtl
    ? { disabled: !hasPrev, onClick: goPrev, label: prevLabel }
    : { disabled: !hasNext, onClick: goNext, label: nextLabel };

  return { left, right };
}

/** Fixed prev/next beside the dialog (desktop only). Swaps sides in RTL. */
export function DialogSideNavDesktop(props: SideNavProps) {
  const isRtl = useDirection() === "rtl";
  const { left, right } = getSideNavSlots(isRtl, props);

  if (!props.enabled) return null;

  return (
    <>
      <NavButton
        chevron="left"
        disabled={left.disabled}
        onClick={left.onClick}
        label={left.label}
        className={DESKTOP_LEFT_CLASS}
      />
      <NavButton
        chevron="right"
        disabled={right.disabled}
        onClick={right.onClick}
        label={right.label}
        className={DESKTOP_RIGHT_CLASS}
      />
    </>
  );
}

/** Compact prev/next row for the dialog header (mobile only). */
export function DialogSideNavMobile(props: SideNavProps) {
  const isRtl = useDirection() === "rtl";
  const { left, right } = getSideNavSlots(isRtl, props);

  if (!props.enabled) return null;

  return (
    <div className="flex shrink-0 items-center gap-1 sm:hidden">
      <NavButton
        chevron="left"
        size="icon-sm"
        disabled={left.disabled}
        onClick={left.onClick}
        label={left.label}
      />
      <NavButton
        chevron="right"
        size="icon-sm"
        disabled={right.disabled}
        onClick={right.onClick}
        label={right.label}
      />
    </div>
  );
}

/**
 * Prev/next controls — fixed outside the dialog on desktop, inline on mobile.
 * In RTL, next is on the left and prev on the right (chevrons point outward).
 */
export function DialogSideNav(props: SideNavProps) {
  return (
    <>
      <DialogSideNavDesktop {...props} />
      <DialogSideNavMobile {...props} />
    </>
  );
}
