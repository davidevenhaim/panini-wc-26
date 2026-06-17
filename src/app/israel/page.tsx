import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import Iconify from "@/components/ui/iconify";
import { Typography } from "@/components/ui/typography";
import WEB_ROUTES from "@/constants/web-routes.constants";
import { FOOTBALL_STARS_ALBUMS, SUPERGOL_LEGACY_ALBUMS } from "@/data/israel/albums";
import { ISRAEL_FAMILY } from "@/data/israel/family";
import { IsraelLibraryView } from "@/features/library/israel-library-view";

type Props = { searchParams: Promise<{ order?: string }> };

export default async function IsraelPage({ searchParams }: Props) {
  const t = await getTranslations();
  const { order } = await searchParams;
  const chronological = order === "asc";

  return (
    <main
      dir="rtl"
      className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-10"
      style={{
        background: `radial-gradient(ellipse at top, ${ISRAEL_FAMILY.theme.primary}15, transparent 60%)`,
      }}
    >
      <div className="mb-4">
        <Button asChild variant="ghost" size="sm">
          <Link href={WEB_ROUTES.HOME}>
            <Iconify icon="lucide:arrow-left" className="size-4" />
            {t("back")}
          </Link>
        </Button>
      </div>

      <header className="mb-8">
        <Typography
          variant="overline"
          as="span"
          className="text-foreground/50 text-[10px] font-bold tracking-[0.18em] uppercase"
        >
          {t("israel.eyebrow")}
        </Typography>
        <Typography
          variant="h6"
          as="h1"
          className="font-heading text-3xl font-black sm:text-5xl"
          style={{ color: ISRAEL_FAMILY.theme.primary }}
        >
          {t("israel.title")}
        </Typography>
        <Typography variant="body2" as="p" color="muted" className="mt-2 max-w-prose">
          {t("israel.subtitle")}
        </Typography>
      </header>

      <div className="mb-6 flex flex-wrap items-center gap-2">
        <Button
          asChild
          variant={!chronological ? "default" : "outline"}
          size="sm"
          className="rounded-full"
        >
          <Link href={WEB_ROUTES.ISRAEL}>
            <Iconify icon="lucide:arrow-down-narrow-wide" className="size-3.5" />
            {t("israel.orderNewest")}
          </Link>
        </Button>
        <Button
          asChild
          variant={chronological ? "default" : "outline"}
          size="sm"
          className="rounded-full"
        >
          <Link href={`${WEB_ROUTES.ISRAEL}?order=asc`}>
            <Iconify icon="lucide:arrow-up-narrow-wide" className="size-3.5" />
            {t("israel.orderOldest")}
          </Link>
        </Button>
      </div>

      <IsraelLibraryView
        modern={FOOTBALL_STARS_ALBUMS}
        legacy={SUPERGOL_LEGACY_ALBUMS}
        chronological={chronological}
      />
    </main>
  );
}

export async function generateMetadata() {
  const t = await getTranslations();
  return {
    title: t("israel.title"),
    description: t("israel.subtitle"),
  };
}
