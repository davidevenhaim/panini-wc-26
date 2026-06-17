"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { ALBUMS, COLLECTION_FAMILIES, getFamilyAlbums } from "@/collections/catalog";
import type { Album } from "@/collections/schema";
import { Button } from "@/components/ui/button";
import Iconify from "@/components/ui/iconify";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLocalizedText } from "@/hooks/use-localized-text";
import { cn } from "@/lib/utils";
import WEB_ROUTES from "@/constants/web-routes.constants";

type Props = {
  album: Album;
};

export function AlbumNavBar({ album }: Props) {
  const t = useTranslations();
  const lt = useLocalizedText();

  const familyAlbums = getFamilyAlbums(album.familyId);
  const currentIndex = ALBUMS.findIndex((a) => a.id === album.id);
  const prevAlbum = currentIndex > 0 ? ALBUMS[currentIndex - 1] : null;
  const nextAlbum =
    currentIndex >= 0 && currentIndex < ALBUMS.length - 1 ? ALBUMS[currentIndex + 1] : null;

  return (
    <nav className="bg-background/80 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-30 border-b backdrop-blur">
      <div className="mx-auto flex w-full flex-col gap-2 px-4 py-2 sm:px-6 lg:px-10">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <Button asChild variant="ghost" size="sm" className="shrink-0 rounded-full">
            <Link href={WEB_ROUTES.HOME}>
              <Iconify icon="lucide:library" className="size-4" />
              <span className="hidden sm:inline">{t("library.navBack")}</span>
            </Link>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="min-w-0 flex-1 justify-between gap-2 rounded-full sm:max-w-xs"
                aria-label={t("album.nav.switchAlbum")}
              >
                <span className="truncate font-semibold">{lt(album.title)}</span>
                <Iconify icon="lucide:chevrons-up-down" className="size-4 shrink-0 opacity-60" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              className="max-h-[min(70vh,24rem)] w-72 overflow-y-auto"
            >
              {COLLECTION_FAMILIES.map((family, familyIndex) => {
                const albums = getFamilyAlbums(family.id);
                if (albums.length === 0) return null;
                return (
                  <div key={family.id}>
                    {familyIndex > 0 ? <DropdownMenuSeparator /> : null}
                    <DropdownMenuLabel className="text-xs font-bold tracking-wide uppercase">
                      {lt(family.name)}
                    </DropdownMenuLabel>
                    {albums.map((entry) => (
                      <DropdownMenuItem key={entry.id} asChild>
                        <Link
                          href={WEB_ROUTES.ALBUM(entry.slug)}
                          className={cn(entry.id === album.id && "font-bold")}
                        >
                          {lt(entry.title)}
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </div>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="flex shrink-0 items-center gap-1">
            {prevAlbum ? (
              <Button asChild variant="outline" size="icon-sm" className="rounded-full">
                <Link href={WEB_ROUTES.ALBUM(prevAlbum.slug)} aria-label={t("album.nav.previous")}>
                  <Iconify icon="lucide:chevron-left" className="size-4 rtl:rotate-180" />
                </Link>
              </Button>
            ) : (
              <Button
                variant="outline"
                size="icon-sm"
                className="rounded-full"
                disabled
                aria-label={t("album.nav.previous")}
              >
                <Iconify icon="lucide:chevron-left" className="size-4 rtl:rotate-180" />
              </Button>
            )}
            {nextAlbum ? (
              <Button asChild variant="outline" size="icon-sm" className="rounded-full">
                <Link href={WEB_ROUTES.ALBUM(nextAlbum.slug)} aria-label={t("album.nav.next")}>
                  <Iconify icon="lucide:chevron-right" className="size-4 rtl:rotate-180" />
                </Link>
              </Button>
            ) : (
              <Button
                variant="outline"
                size="icon-sm"
                className="rounded-full"
                disabled
                aria-label={t("album.nav.next")}
              >
                <Iconify icon="lucide:chevron-right" className="size-4 rtl:rotate-180" />
              </Button>
            )}
          </div>
        </div>

        {familyAlbums.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {familyAlbums.map((entry) => {
              const active = entry.id === album.id;
              const label = lt(entry.shortTitle ?? entry.title);
              return (
                <Link
                  key={entry.id}
                  href={WEB_ROUTES.ALBUM(entry.slug)}
                  className={cn(
                    "shrink-0 rounded-full px-3 py-1 text-xs font-semibold ring-1 transition-colors",
                    active
                      ? "bg-primary text-primary-foreground ring-primary/40"
                      : "bg-muted/60 text-foreground/80 ring-border/50 hover:bg-muted"
                  )}
                  aria-current={active ? "page" : undefined}
                >
                  {label}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </nav>
  );
}
