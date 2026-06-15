import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";
import Iconify from "@/components/ui/iconify";
import WEB_ROUTES from "@/constants/web-routes.constants";

export default async function NotFoundPage() {
  const t = await getTranslations("notFound");

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-8 text-center">
      <Typography variant="h1" className="text-muted-foreground/30 text-8xl font-bold">
        404
      </Typography>
      <div className="space-y-2">
        <Typography variant="h3" className="text-foreground">
          {t("title")}
        </Typography>
        <Typography variant="body2" className="text-muted-foreground max-w-sm">
          {t("description")}
        </Typography>
      </div>
      <Button asChild variant="outline">
        <Link href={WEB_ROUTES.HOME}>
          <Iconify icon="lucide:arrow-left" className="size-4" />
          {t("back")}
        </Link>
      </Button>
    </div>
  );
}
