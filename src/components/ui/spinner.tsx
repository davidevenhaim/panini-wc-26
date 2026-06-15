"use client";

import Iconify from "@/components/ui/iconify";
import { useTranslations } from "next-intl";

import { cn } from "@/lib/utils";

function Spinner({ className }: { className?: string }) {
  const t = useTranslations();

  return (
    <Iconify
      icon="lucide:loader-2"
      role="status"
      aria-label={t("loading")}
      className={cn("size-4 animate-spin", className)}
    />
  );
}

export { Spinner };
