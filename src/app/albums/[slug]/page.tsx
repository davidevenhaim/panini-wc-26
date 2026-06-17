import { notFound } from "next/navigation";
import { getAlbumBySlug } from "@/collections/catalog";
import { AlbumRouter } from "@/features/album/album-router";
import { PublicCollectorsSection } from "@/features/profile/public-collectors-section";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ match?: string }>;
};

export default async function AlbumRoute({ params, searchParams }: Props) {
  const { slug } = await params;
  const { match } = await searchParams;
  const album = getAlbumBySlug(slug);
  if (!album) notFound();

  // Only the WC26 album currently embeds the collectors directory — the other
  // albums are metadata-only and don't have any synced data yet.
  const showCollectors = album.id === "panini-world-cup-2026";

  return (
    <AlbumRouter
      album={album}
      collectors={
        showCollectors ? (
          <PublicCollectorsSection
            matchOnly={match === "1"}
            basePath={`/albums/${slug}`}
            placement="middle"
          />
        ) : null
      }
    />
  );
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const album = getAlbumBySlug(slug);
  if (!album) return {};
  return {
    title: album.title.en ?? album.title.he,
    description: `${album.publisher ?? ""} ${album.season ?? ""}`.trim(),
  };
}
