"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import type { User } from "@supabase/supabase-js";
import { useTranslations } from "next-intl";
import { AppSettingsDialog } from "@/components/app/app-settings-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import Iconify from "@/components/ui/iconify";
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
import { SITE_METADATA } from "@/constants/site-metadata.constants";
import { exportExcel } from "./exporters";

function getUserAvatarUrl(user: User): string | null {
  const meta = user.user_metadata as Record<string, unknown>;
  return (
    (typeof meta.avatar_url === "string" && meta.avatar_url) ||
    (typeof meta.picture === "string" && meta.picture) ||
    null
  );
}

function getUserInitial(user: User): string {
  const meta = user.user_metadata as Record<string, unknown>;
  const label =
    (typeof meta.full_name === "string" && meta.full_name) ||
    (typeof meta.name === "string" && meta.name) ||
    user.email?.split("@")[0] ||
    "?";
  return label.charAt(0).toUpperCase();
}

type Props = {
  onOpenImportExport: () => void;
  onOpenReset: () => void;
};

function AccountNavButton({
  user,
  isAuthenticated,
  loginLabel,
  profileLabel,
}: {
  user: User | null;
  isAuthenticated: boolean;
  loginLabel: string;
  profileLabel: string;
}) {
  if (isAuthenticated && user) {
    const avatarUrl = getUserAvatarUrl(user);
    return (
      <Button asChild variant="outline" className="h-8 gap-2 rounded-full px-1.5 sm:px-3">
        <Link href={WEB_ROUTES.PROFILE} aria-label={profileLabel}>
          <Avatar size="sm" className="ring-border/40 size-7 ring-1">
            {avatarUrl ? <AvatarImage src={avatarUrl} alt="" referrerPolicy="no-referrer" /> : null}
            <AvatarFallback className="bg-gradient-to-br from-emerald-500 via-sky-500 to-violet-600 text-xs font-bold text-white">
              {getUserInitial(user)}
            </AvatarFallback>
          </Avatar>
          <span className="hidden max-w-[10ch] truncate sm:inline">
            {user.email?.split("@")[0] ?? profileLabel}
          </span>
        </Link>
      </Button>
    );
  }

  return (
    <Button asChild variant="outline" className="h-8 gap-2 rounded-full px-1.5 sm:px-3">
      <Link href={WEB_ROUTES.LOGIN} aria-label={loginLabel}>
        <Avatar size="sm" className="ring-border/40 size-7 ring-1">
          <AvatarFallback className="bg-muted text-muted-foreground">
            <Iconify icon="lucide:circle-user" className="size-5" aria-hidden />
          </AvatarFallback>
        </Avatar>
        <span className="hidden sm:inline">{loginLabel}</span>
      </Link>
    </Button>
  );
}

export function AlbumHeader({ onOpenImportExport, onOpenReset }: Props) {
  const t = useTranslations();
  const quantities = useCollectionStore((s) => s.quantities);
  const { user, isAuthenticated, isLoading } = usePermissions();
  const [settingsOpen, setSettingsOpen] = React.useState(false);

  const handleExportExcel = () => {
    exportExcel(quantities);
    toastSuccess(t("album.importExport.exported"));
  };

  return (
    <>
      <header className="mb-4 flex items-center gap-3">
        <div className="ring-border/30 relative h-12 w-12 shrink-0 overflow-hidden rounded-2xl shadow-md ring-1">
          <Image
            src={SITE_METADATA.logoPath}
            alt=""
            width={48}
            height={48}
            className="h-full w-full object-contain p-1"
            priority
            unoptimized
          />
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
            className="hidden bg-emerald-600 hover:bg-emerald-700 sm:inline-flex"
            aria-label={t("album.menu.exportExcel")}
          >
            <Iconify icon="lucide:file-spreadsheet" className="size-4" />
            <span>{t("album.menu.exportExcel")}</span>
          </Button>

          {CONFIG.isSupabaseConfigured && !isLoading && (
            <AccountNavButton
              user={user}
              isAuthenticated={isAuthenticated}
              loginLabel={t("profile.login")}
              profileLabel={t("profile.myProfile")}
            />
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm" aria-label={t("album.menu.title")}>
                <Iconify icon="lucide:more-horizontal" className="size-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setSettingsOpen(true)}>
                <Iconify icon="lucide:settings" className="size-4" />
                {t("album.menu.settings")}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleExportExcel}>
                <Iconify icon="lucide:file-spreadsheet" className="size-4" />
                {t("album.menu.exportExcel")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onOpenImportExport}>
                <Iconify icon="lucide:download" className="size-4" />
                {t("album.menu.importExport")}
              </DropdownMenuItem>
              {CONFIG.isSupabaseConfigured && (
                <DropdownMenuItem asChild>
                  <Link href={WEB_ROUTES.USERS}>
                    <Iconify icon="lucide:users" className="size-4" />
                    {t("users.browse")}
                  </Link>
                </DropdownMenuItem>
              )}
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

      <AppSettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
    </>
  );
}
