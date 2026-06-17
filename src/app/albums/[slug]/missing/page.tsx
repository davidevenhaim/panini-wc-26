import { notFound } from "next/navigation";
import { getLocale } from "next-intl/server";
import { getAlbumBySlug } from "@/collections/catalog";
import { resolveAppLocale } from "@/constants/locale";
import { pickLocalizedText } from "@/utils/localized-text";
import { AlbumMissingView } from "@/features/album/generic/album-missing-view";

type Props = { params: Promise<{ slug: string }> };

export default async function AlbumMissingRoute({ params }: Props) {
  const { slug } = await params;
  const album = getAlbumBySlug(slug);
  if (!album) notFound();
  return <AlbumMissingView album={album} />;
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const album = getAlbumBySlug(slug);
  if (!album) return {};
  const locale = resolveAppLocale(await getLocale());
  return {
    title: `Missing — ${pickLocalizedText(album.title, locale)}`,
  };
}
