import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import Iconify from "@/components/ui/iconify";
import { Typography } from "@/components/ui/typography";
import WEB_ROUTES from "@/constants/web-routes.constants";
import {
  ADRENALYN_ALBUMS_SORTED_ASC,
  ADRENALYN_ALBUMS_SORTED_DESC,
  WORLD_CUP_ALBUMS_SORTED_ASC,
  WORLD_CUP_ALBUMS_SORTED_DESC,
} from "@/collections/catalog";
import { WORLD_CUP_FAMILY } from "@/data/world-cup/family";
import { AlbumCard } from "@/features/library/album-card";

type Props = { searchParams: Promise<{ order?: string; tab?: string }> };

type TabId = "stickers" | "adrenalyn";

function isTab(input: string | undefined): input is TabId {
  return input === "stickers" || input === "adrenalyn";
}

export default async function FifaWorldCupPage({ searchParams }: Props) {
  const t = await getTranslations();
  const { order, tab } = await searchParams;
  const chronological = order === "asc";
  const activeTab: TabId = isTab(tab) ? tab : "stickers";

  const stickerAlbums = chronological ? WORLD_CUP_ALBUMS_SORTED_ASC : WORLD_CUP_ALBUMS_SORTED_DESC;
  const adrenalynAlbums = chronological
    ? ADRENALYN_ALBUMS_SORTED_ASC
    : ADRENALYN_ALBUMS_SORTED_DESC;
  const albums = activeTab === "adrenalyn" ? adrenalynAlbums : stickerAlbums;

  const baseHref = WEB_ROUTES.FIFA_WORLD_CUP;
  const stickersHref = `${baseHref}${chronological ? "?order=asc" : ""}`;
  const adrenalynHref = `${baseHref}?tab=adrenalyn${chronological ? "&order=asc" : ""}`;
  const newestHref = activeTab === "adrenalyn" ? `${baseHref}?tab=adrenalyn` : baseHref;
  const oldestHref =
    activeTab === "adrenalyn" ? `${baseHref}?tab=adrenalyn&order=asc` : `${baseHref}?order=asc`;

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-10">
      <div className="mb-4">
        <Button asChild variant="ghost" size="sm">
          <Link href={WEB_ROUTES.HOME}>
            <Iconify icon="lucide:arrow-left" className="size-4" />
            {t("back")}
          </Link>
        </Button>
      </div>

      <header
        className="mb-6 overflow-hidden rounded-3xl p-6 text-white shadow-lg"
        style={{
          background: `linear-gradient(135deg, ${WORLD_CUP_FAMILY.theme.primary}, ${WORLD_CUP_FAMILY.theme.accent ?? WORLD_CUP_FAMILY.theme.primary})`,
        }}
      >
        <Typography
          variant="overline"
          as="span"
          className="text-[11px] font-bold tracking-[0.18em] text-white/80 uppercase"
        >
          {t("worldCup.eyebrow")}
        </Typography>
        <Typography variant="h6" as="h1" className="font-heading text-3xl font-black sm:text-4xl">
          {t("worldCup.title")}
        </Typography>
        <Typography variant="caption2" as="p" className="mt-2 max-w-prose text-white/85">
          {t("worldCup.subtitle")}
        </Typography>
      </header>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Button
          asChild
          variant={activeTab === "stickers" ? "default" : "outline"}
          size="sm"
          className="rounded-full"
        >
          <Link href={stickersHref}>
            <Iconify icon="lucide:sticker" className="size-3.5" />
            {t("worldCup.tabStickers")} · {stickerAlbums.length}
          </Link>
        </Button>
        <Button
          asChild
          variant={activeTab === "adrenalyn" ? "default" : "outline"}
          size="sm"
          className="rounded-full"
        >
          <Link href={adrenalynHref}>
            <Iconify icon="lucide:layers" className="size-3.5" />
            {t("worldCup.tabAdrenalyn")} · {adrenalynAlbums.length}
          </Link>
        </Button>
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-2">
        <Button
          asChild
          variant={!chronological ? "default" : "outline"}
          size="sm"
          className="rounded-full"
        >
          <Link href={newestHref}>
            <Iconify icon="lucide:arrow-down-narrow-wide" className="size-3.5" />
            {t("worldCup.orderNewest")}
          </Link>
        </Button>
        <Button
          asChild
          variant={chronological ? "default" : "outline"}
          size="sm"
          className="rounded-full"
        >
          <Link href={oldestHref}>
            <Iconify icon="lucide:arrow-up-narrow-wide" className="size-3.5" />
            {t("worldCup.orderOldest")}
          </Link>
        </Button>
      </div>

      {albums.length === 0 ? (
        <Typography variant="body2" as="p" color="muted">
          {t("library.empty")}
        </Typography>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {albums.map((a) => (
            <AlbumCard key={a.id} album={a} />
          ))}
        </div>
      )}
    </main>
  );
}

export async function generateMetadata() {
  const t = await getTranslations();
  return {
    title: t("worldCup.title"),
    description: t("worldCup.subtitle"),
  };
}
