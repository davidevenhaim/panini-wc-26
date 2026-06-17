import { notFound } from "next/navigation";
import { getAlbumBySlug } from "@/collections/catalog";
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
  return {
    title: `Missing — ${album.title.en ?? album.title.he}`,
  };
}
