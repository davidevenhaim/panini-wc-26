"use client";

import { useTranslations } from "next-intl";
import { Typography } from "@/components/ui/typography";
import { BUY_ME_A_COFFEE_URL } from "@/constants/app.constants";

export function AlbumFooter() {
  const t = useTranslations();

  return (
    <footer className="mt-8 text-center">
      <Typography variant="caption2" as="p" color="muted">
        {t("album.footerNote")}
      </Typography>
      <Typography variant="caption2" as="p" color="muted" className="mt-1">
        <a
          href={BUY_ME_A_COFFEE_URL}
          target="_blank"
          rel="noreferrer"
          className="text-foreground/70 hover:text-foreground underline underline-offset-2 transition-colors"
        >
          {t("album.buyMeACoffee")}
        </a>
      </Typography>
    </footer>
  );
}
