"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";
import Iconify from "@/components/ui/iconify";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("errorBoundary");

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-8 text-center">
      <div className="bg-destructive/10 flex size-16 items-center justify-center rounded-full">
        <Iconify icon="lucide:triangle-alert" className="text-destructive size-8" />
      </div>
      <div className="space-y-2">
        <Typography variant="h3" className="text-foreground">
          {t("title")}
        </Typography>
        <Typography variant="body2" className="text-muted-foreground max-w-sm">
          {t("description")}
        </Typography>
      </div>
      <Button type="button" onClick={reset}>
        <Iconify icon="lucide:refresh-cw" className="size-4" />
        {t("refresh")}
      </Button>
    </div>
  );
}
