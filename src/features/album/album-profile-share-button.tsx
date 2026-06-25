"use client";

import { useTranslations } from "next-intl";
import type { Album } from "@/collections/schema";
import { Button } from "@/components/ui/button";
import Iconify from "@/components/ui/iconify";
import { Typography } from "@/components/ui/typography";
import { useLocalizedText } from "@/hooks/use-localized-text";
import { useAlbumShareUrl } from "@/hooks/use-album-share-url";
import { AlbumShareCopyButton } from "./album-share-copy-button";

type Props = {
  album: Album;
};

export function AlbumProfileShareButton({ album }: Props) {
  const t = useTranslations();
  const lt = useLocalizedText();
  const { shareUrl, isConfigured } = useAlbumShareUrl(album.slug);

  if (!isConfigured || album.dataStatus === "metadata-only") return null;

  return (
    <div className="bg-muted/30 mb-4 rounded-2xl border p-3">
      <Typography variant="caption2" as="p" color="muted" className="mb-2">
        {t("profile.shareLinkHint", { album: lt(album.title) })}
      </Typography>
      <div className="flex flex-wrap gap-2">
        <AlbumShareCopyButton album={album} />
        {shareUrl && (
          <Button type="button" size="sm" asChild>
            <a href={shareUrl} target="_blank" rel="noreferrer">
              <Iconify icon="lucide:external-link" className="size-4" />
              {t("profile.openShare")}
            </a>
          </Button>
        )}
      </div>
    </div>
  );
}
