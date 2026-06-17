"use client";

import * as React from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import Iconify from "@/components/ui/iconify";
import { Typography } from "@/components/ui/typography";
import { useLocalizedText } from "@/hooks/use-localized-text";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { toastSuccess, toastError } from "@/lib/toast";
import WEB_ROUTES from "@/constants/web-routes.constants";
import { useCollectionStore } from "@/store/collection.store";
import { buildMissingTextForAlbum, listAlbumMissing } from "@/lib/album/album-progress";
import { ReportButton } from "@/features/data-reports/report-button";
import { useItemTerminology } from "../use-item-terminology";
import { AlbumNavBar } from "../album-nav-bar";
import type { Album } from "@/collections/schema";

type Props = { album: Album };

function downloadFile(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function AlbumMissingView({ album }: Props) {
  const t = useTranslations();
  const lt = useLocalizedText();
  const term = useItemTerminology(album);
  const rtl = album.theme.direction === "rtl";

  const hydrate = useCollectionStore((s) => s.hydrate);
  const isHydrated = useCollectionStore((s) => s.isHydrated);
  const setActiveAlbum = useCollectionStore((s) => s.setActiveAlbum);
  const getAlbumQuantities = useCollectionStore((s) => s.getAlbumQuantities);

  React.useEffect(() => {
    hydrate();
    setActiveAlbum(album.id);
  }, [hydrate, setActiveAlbum, album.id]);

  const quantities = getAlbumQuantities(album.id);
  const rows = React.useMemo(() => listAlbumMissing(album, quantities), [album, quantities]);
  const text = React.useMemo(
    () => buildMissingTextForAlbum(album, quantities),
    [album, quantities]
  );

  const { copy } = useCopyToClipboard();

  async function onCopy() {
    const ok = await copy(text);
    if (ok) toastSuccess(t("albumLists.copied"));
    else toastError(t("albumLists.copyFailed"));
  }

  function onDownload() {
    const slug = album.slug;
    const stamp = new Date().toISOString().slice(0, 10);
    downloadFile(`${slug}-missing-${stamp}.txt`, text, "text/plain;charset=utf-8");
  }

  if (!isHydrated) {
    return (
      <main className="mx-auto w-full px-4 py-10 sm:px-6 lg:px-10">
        <Typography variant="body2" as="p" color="muted" className="text-center">
          {t("loading")}
        </Typography>
      </main>
    );
  }

  return (
    <>
      <AlbumNavBar album={album} />
      <main
        dir={rtl ? "rtl" : undefined}
        className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 lg:px-10"
      >
        <div className="mb-4">
          <Button asChild variant="ghost" size="sm">
            <Link href={WEB_ROUTES.ALBUM(album.slug)}>
              <Iconify icon="lucide:arrow-left" className="size-4" />
              {t("albumLists.backToAlbum")}
            </Link>
          </Button>
        </div>

        <header className="mb-6">
          <Typography
            variant="overline"
            as="span"
            className="text-foreground/50 text-[10px] font-bold tracking-[0.18em] uppercase"
          >
            {lt(album.title)}
          </Typography>
          <Typography
            variant="h6"
            as="h1"
            className="font-heading text-2xl font-extrabold sm:text-3xl"
          >
            {term.missingTitle}
          </Typography>
          <Typography variant="caption2" as="p" color="muted" className="mt-1">
            {t("albumLists.missingSubtitle")} · {t("albumLists.totalCount", { count: rows.length })}
          </Typography>
        </header>

        <div className="mb-4 flex flex-wrap gap-2">
          <Button onClick={onCopy} disabled={rows.length === 0}>
            <Iconify icon="lucide:copy" className="size-4" />
            {t("albumLists.copyCodes")}
          </Button>
          <Button variant="outline" onClick={onDownload} disabled={rows.length === 0}>
            <Iconify icon="lucide:download" className="size-4" />
            {t("albumLists.downloadTxt")}
          </Button>
          <ReportButton
            variant="ghost"
            className="ms-auto"
            context={{
              albumId: album.id,
              albumTitle: lt(album.title),
              itemType: album.itemType,
            }}
          />
        </div>

        {rows.length === 0 ? (
          <div className="bg-card rounded-3xl border-2 border-dashed p-8 text-center">
            <Iconify icon="lucide:party-popper" className="text-foreground/30 mx-auto size-10" />
            <Typography variant="body2" as="p" color="muted" className="mt-2">
              {t("albumLists.emptyMissing")}
            </Typography>
          </div>
        ) : (
          <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
            {rows.map((row) => (
              <li
                key={row.item.id}
                className="bg-card rounded-xl border p-3 text-center font-mono text-sm font-semibold"
                dir="ltr"
              >
                {row.item.code}
              </li>
            ))}
          </ul>
        )}
      </main>
    </>
  );
}
