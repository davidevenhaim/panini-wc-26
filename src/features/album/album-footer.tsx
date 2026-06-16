"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import Iconify from "@/components/ui/iconify";
import { Typography } from "@/components/ui/typography";
import { BUY_ME_A_COFFEE_URL, SKELETON_URL } from "@/constants/app.constants";

export function AlbumFooter() {
  const t = useTranslations();

  return (
    <footer className="mt-8 flex flex-col items-center gap-3 text-center">
      <Typography variant="caption2" as="p" color="muted">
        {t("album.footerNote")}
      </Typography>

      <Button
        asChild
        variant="outline"
        size="sm"
        className="border-amber-300/70 bg-gradient-to-r from-amber-50 via-orange-50 to-amber-100/80 text-amber-950 shadow-sm ring-1 ring-amber-200/50 hover:border-amber-400/80 hover:from-amber-100 hover:via-orange-100 hover:to-amber-200/80 dark:border-amber-700/60 dark:from-amber-950/55 dark:via-orange-950/40 dark:to-amber-900/50 dark:text-amber-50 dark:ring-amber-800/40 dark:hover:from-amber-950/75 dark:hover:via-orange-950/55 dark:hover:to-amber-900/65"
      >
        <a href={BUY_ME_A_COFFEE_URL} target="_blank" rel="noreferrer">
          <Iconify
            icon="lucide:coffee"
            className="size-4 text-amber-700 dark:text-amber-300"
            aria-hidden
          />
          {t("album.buyMeACoffee")}
        </a>
      </Button>

      <Typography variant="caption2" as="p" color="muted" className="max-w-sm">
        <Iconify icon="lucide:layers-2" className="me-1 inline size-3 opacity-70" aria-hidden />
        {t("album.skeletonCredit")}{" "}
        <a
          href={SKELETON_URL}
          target="_blank"
          rel="noreferrer"
          className="text-foreground/60 hover:text-foreground underline underline-offset-2 transition-colors"
        >
          {t("album.skeletonCreditLink")}
        </a>
      </Typography>
    </footer>
  );
}
