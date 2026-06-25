"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import type { Album } from "@/collections/schema";
import { Button } from "@/components/ui/button";
import Iconify from "@/components/ui/iconify";
import { useAlbumShareUrl } from "@/hooks/use-album-share-url";
import { toastError, toastSuccess } from "@/lib/toast";
import { cn } from "@/lib/utils";
import { copyTextToClipboard } from "@/utils/clipboard.utils";
import WEB_ROUTES from "@/constants/web-routes.constants";

type Props = {
  album: Album;
  /** Icon-only for cards; default shows label on sm+ */
  variant?: "icon" | "default";
  className?: string;
  /** Block parent link/card navigation (e.g. album cards). Defaults to true for icon variant. */
  stopPropagation?: boolean;
};

function blockParentActivation(event: React.SyntheticEvent) {
  event.preventDefault();
  event.stopPropagation();
}

export function AlbumShareCopyButton({
  album,
  variant = "default",
  className,
  stopPropagation: stopPropagationProp,
}: Props) {
  const t = useTranslations();
  const router = useRouter();
  const { isLoading, isAuthenticated, resolveShareUrl, isConfigured } = useAlbumShareUrl(
    album.slug
  );
  const [copying, setCopying] = React.useState(false);

  const stopPropagation = stopPropagationProp ?? variant === "icon";

  if (!isConfigured || album.dataStatus === "metadata-only") return null;

  async function onShare(event: React.MouseEvent) {
    if (stopPropagation) blockParentActivation(event);

    if (isLoading || copying) return;

    if (!isAuthenticated) {
      router.push(WEB_ROUTES.LOGIN);
      return;
    }

    setCopying(true);
    try {
      const url = await resolveShareUrl();
      if (!url) {
        toastError(t("album.share.setupRequired"));
        router.push(WEB_ROUTES.PROFILE);
        return;
      }

      const ok = await copyTextToClipboard(url);
      if (ok) toastSuccess(t("profile.copied"));
      else toastError(t("profile.copyFailed"));
    } finally {
      setCopying(false);
    }
  }

  const busy = isLoading || copying;

  // Use aria-disabled (not disabled) to avoid pointer-events:none from the Button
  // base styles. With disabled+pointer-events:none, click would fall through to
  // an underlying Link (album-card uses a stretched-link overlay behind this).
  const sharedButtonProps = {
    type: "button" as const,
    "aria-disabled": busy,
    "aria-busy": copying,
    className: cn(busy && "cursor-not-allowed opacity-60"),
    onClick: onShare,
    ...(stopPropagation
      ? { onPointerDown: blockParentActivation, onMouseDown: blockParentActivation }
      : {}),
  };

  if (variant === "icon") {
    return (
      <Button
        {...sharedButtonProps}
        variant="outline"
        size="icon-sm"
        className={cn(
          "bg-background/90 rounded-full shadow-sm backdrop-blur-sm",
          sharedButtonProps.className,
          className
        )}
        aria-label={t("album.share.copyLinkAria")}
      >
        <Iconify icon="lucide:share-2" className="size-4" />
      </Button>
    );
  }

  return (
    <Button
      {...sharedButtonProps}
      variant="outline"
      size="sm"
      className={cn("shrink-0 rounded-full", sharedButtonProps.className, className)}
    >
      <Iconify icon="lucide:share-2" className="size-4" />
      <span className="hidden sm:inline">{t("album.share.copyLink")}</span>
    </Button>
  );
}
