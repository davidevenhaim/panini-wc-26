import { AlbumPage } from "@/features/album/album-page";
import { PublicCollectorsSection } from "@/features/profile/public-collectors-section";

type Props = { searchParams: Promise<{ match?: string }> };

export default async function RootPage({ searchParams }: Props) {
  const { match } = await searchParams;
  return (
    <AlbumPage
      collectors={
        <PublicCollectorsSection matchOnly={match === "1"} basePath="/" placement="middle" />
      }
    />
  );
}
