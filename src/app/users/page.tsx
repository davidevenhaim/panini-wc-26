import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import Iconify from "@/components/ui/iconify";
import { Typography } from "@/components/ui/typography";
import WEB_ROUTES from "@/constants/web-routes.constants";
import { CONFIG } from "@/lib/app-config";
import { PublicCollectorsSection } from "@/features/profile/public-collectors-section";

type RouteProps = { searchParams: Promise<{ match?: string }> };

export default async function UsersPage({ searchParams }: RouteProps) {
  const t = await getTranslations();
  const { match: matchParam } = await searchParams;
  const matchOnly = matchParam === "1";

  if (!CONFIG.isSupabaseConfigured) {
    return (
      <main className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6">
        <Typography variant="body2" as="p" color="muted">
          {t("authSupabase.supabaseNotConfiguredHint")}
        </Typography>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-7xl px-4 pt-8 sm:px-6 lg:px-10">
      <div className="mb-4 flex items-center justify-between gap-2">
        <Button asChild variant="ghost" size="sm">
          <Link href={WEB_ROUTES.HOME}>
            <Iconify icon="lucide:arrow-left" className="size-4" />
            {t("back")}
          </Link>
        </Button>
      </div>

      <PublicCollectorsSection matchOnly={matchOnly} basePath={WEB_ROUTES.USERS} />
    </main>
  );
}
