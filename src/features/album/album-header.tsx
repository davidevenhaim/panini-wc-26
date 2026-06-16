"use client";

import * as React from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { LocaleDialog } from "@/components/app";
import { Button } from "@/components/ui/button";
import Iconify from "@/components/ui/iconify";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Typography } from "@/components/ui/typography";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toastSuccess } from "@/lib/toast";
import { useCollectionStore } from "@/store/collection.store";
import { usePermissions } from "@/hooks/use-permissions";
import { CONFIG } from "@/lib/app-config";
import WEB_ROUTES from "@/constants/web-routes.constants";
import { exportExcel } from "./exporters";

type Props = {
  onOpenImportExport: () => void;
  onOpenReset: () => void;
};

export function AlbumHeader({ onOpenImportExport, onOpenReset }: Props) {
  const t = useTranslations();
  const quantities = useCollectionStore((s) => s.quantities);
  const { user, isAuthenticated, isLoading } = usePermissions();

  const handleExportExcel = () => {
    exportExcel(quantities);
    toastSuccess(t("album.importExport.exported"));
  };

  return (
    <header className="mb-4 flex items-center gap-3">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-sky-500 to-violet-600 text-white shadow-md">
        <Iconify icon="lucide:sticker" className="size-6" />
      </div>
      <div className="min-w-0 flex-1">
        <Typography
          variant="h6"
          as="h1"
          className="font-heading truncate text-lg leading-tight font-extrabold sm:text-xl"
        >
          {t("album.title")}
        </Typography>
        <Typography variant="caption2" as="p" color="muted" className="truncate">
          {t("album.subtitle")}
        </Typography>
      </div>
      <div className="flex items-center gap-1">
        <Button
          size="sm"
          onClick={handleExportExcel}
          className="bg-emerald-600 hover:bg-emerald-700"
          aria-label={t("album.menu.exportExcel")}
        >
          <Iconify icon="lucide:file-spreadsheet" className="size-4" />
          <span className="hidden sm:inline">{t("album.menu.exportExcel")}</span>
        </Button>
        <ThemeToggle />
        <LocaleDialog />

        {CONFIG.isSupabaseConfigured &&
          !isLoading &&
          (isAuthenticated ? (
            <Button asChild variant="outline" size="sm" className="rounded-full">
              <Link href={WEB_ROUTES.PROFILE}>
                <Iconify icon="lucide:user" className="size-4" />
                <span className="hidden max-w-[10ch] truncate sm:inline">
                  {user?.email?.split("@")[0] ?? t("profile.myProfile")}
                </span>
              </Link>
            </Button>
          ) : (
            <Button asChild variant="outline" size="sm" className="rounded-full">
              <Link href={WEB_ROUTES.LOGIN}>
                <Iconify icon="lucide:log-in" className="size-4" />
                <span className="hidden sm:inline">{t("profile.login")}</span>
              </Link>
            </Button>
          ))}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-sm" aria-label={t("album.menu.title")}>
              <Iconify icon="lucide:more-horizontal" className="size-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleExportExcel}>
              <Iconify icon="lucide:file-spreadsheet" className="size-4" />
              {t("album.menu.exportExcel")}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onOpenImportExport}>
              <Iconify icon="lucide:download" className="size-4" />
              {t("album.menu.importExport")}
            </DropdownMenuItem>
            {CONFIG.isSupabaseConfigured && isAuthenticated && (
              <DropdownMenuItem asChild>
                <Link href={WEB_ROUTES.PROFILE}>
                  <Iconify icon="lucide:user" className="size-4" />
                  {t("profile.myProfile")}
                </Link>
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onOpenReset}>
              <Iconify icon="lucide:trash-2" className="size-4" />
              {t("album.menu.reset")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
