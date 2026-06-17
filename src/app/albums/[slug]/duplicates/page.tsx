import { notFound } from "next/navigation";
import { getAlbumBySlug } from "@/collections/catalog";
import { AlbumDuplicatesView } from "@/features/album/generic/album-duplicates-view";

type Props = { params: Promise<{ slug: string }> };

export default async function AlbumDuplicatesRoute({ params }: Props) {
  const { slug } = await params;
  const album = getAlbumBySlug(slug);
  if (!album) notFound();
  return <AlbumDuplicatesView album={album} />;
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const album = getAlbumBySlug(slug);
  if (!album) return {};
  return {
    title: `Duplicates — ${album.title.en ?? album.title.he}`,
  };
}
