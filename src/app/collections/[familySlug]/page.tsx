import { notFound } from "next/navigation";
import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import Iconify from "@/components/ui/iconify";
import { Typography } from "@/components/ui/typography";
import WEB_ROUTES from "@/constants/web-routes.constants";
import { resolveAppLocale } from "@/constants/locale";
import { getFamilyAlbums, getFamilyBySlug } from "@/collections/catalog";
import { AlbumCard } from "@/features/library/album-card";
import { pickLocalizedText } from "@/utils/localized-text";

type Props = { params: Promise<{ familySlug: string }> };

export default async function FamilyRoute({ params }: Props) {
  const { familySlug } = await params;
  const family = getFamilyBySlug(familySlug);
  if (!family) notFound();

  const t = await getTranslations();
  const locale = resolveAppLocale(await getLocale());
  const albums = getFamilyAlbums(family.id).sort((a, b) => (b.year ?? 0) - (a.year ?? 0));
  const isRtl = family.theme.direction === "rtl";

  return (
    <main
      dir={isRtl ? "rtl" : undefined}
      className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-10"
    >
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
          background: `linear-gradient(135deg, ${family.theme.primary}, ${family.theme.accent ?? family.theme.secondary ?? family.theme.primary})`,
        }}
      >
        <Typography
          variant="overline"
          as="span"
          className="text-[11px] font-bold tracking-[0.18em] text-white/80 uppercase"
        >
          {family.publisher ?? ""}
        </Typography>
        <Typography variant="h6" as="h1" className="font-heading text-3xl font-black sm:text-4xl">
          {pickLocalizedText(family.name, locale)}
        </Typography>
        {family.description && (
          <Typography variant="caption2" as="p" className="mt-2 max-w-prose text-white/85">
            {pickLocalizedText(family.description, locale)}
          </Typography>
        )}
      </header>

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

export async function generateMetadata({ params }: Props) {
  const { familySlug } = await params;
  const family = getFamilyBySlug(familySlug);
  if (!family) return {};
  const locale = resolveAppLocale(await getLocale());
  return { title: pickLocalizedText(family.name, locale) };
}
