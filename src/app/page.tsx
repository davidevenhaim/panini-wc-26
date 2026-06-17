import { COLLECTION_FAMILIES, ALBUMS } from "@/collections/catalog";
import { LibraryPage } from "@/features/library/library-page";
import { HomeNavbar } from "@/features/library/home-navbar";
import { PublicCollectorsSection } from "@/features/profile/public-collectors-section";

type Props = { searchParams: Promise<{ match?: string }> };

export default async function RootPage({ searchParams }: Props) {
  const { match } = await searchParams;
  return (
    <>
      <HomeNavbar />
      <LibraryPage families={COLLECTION_FAMILIES} albums={ALBUMS} />
      <PublicCollectorsSection
        matchOnly={match === "1"}
        basePath="/"
        placement="bottom"
        limit={12}
      />
    </>
  );
}
