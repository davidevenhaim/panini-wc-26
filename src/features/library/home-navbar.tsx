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
import { usePermissions } from "@/hooks/use-permissions";
import { CONFIG } from "@/lib/app-config";
import WEB_ROUTES from "@/constants/web-routes.constants";
import { SITE_METADATA } from "@/constants/site-metadata.constants";

function userMeta(user: User): Record<string, unknown> {
  return user.user_metadata as Record<string, unknown>;
}

function userAvatar(user: User): string | null {
  const meta = userMeta(user);
  return (
    (typeof meta.avatar_url === "string" && meta.avatar_url) ||
    (typeof meta.picture === "string" && meta.picture) ||
    null
  );
}

function userInitial(user: User): string {
  const meta = userMeta(user);
  const label =
    (typeof meta.full_name === "string" && meta.full_name) ||
    (typeof meta.name === "string" && meta.name) ||
    user.email?.split("@")[0] ||
    "?";
  return label.charAt(0).toUpperCase();
}

function AccountButton({
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
    const avatarUrl = userAvatar(user);
    return (
      <Button asChild variant="outline" className="h-8 gap-2 rounded-full px-1.5 sm:px-3">
        <Link href={WEB_ROUTES.PROFILE} aria-label={profileLabel}>
          <Avatar size="sm" className="ring-border/40 size-7 ring-1">
            {avatarUrl ? <AvatarImage src={avatarUrl} alt="" referrerPolicy="no-referrer" /> : null}
            <AvatarFallback className="bg-gradient-to-br from-emerald-500 via-sky-500 to-violet-600 text-xs font-bold text-white">
              {userInitial(user)}
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

export function HomeNavbar() {
  const t = useTranslations();
  const { user, isAuthenticated, isLoading } = usePermissions();
  const [settingsOpen, setSettingsOpen] = React.useState(false);

  return (
    <>
      <nav className="bg-background/80 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40 mx-auto w-full border-b backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl items-center gap-3 px-4 py-3 sm:px-6 lg:px-10">
          <Link href={WEB_ROUTES.HOME} className="flex min-w-0 flex-1 items-center gap-3">
            <div className="ring-border/30 relative h-10 w-10 shrink-0 overflow-hidden rounded-xl shadow-sm ring-1">
              <Image
                src={SITE_METADATA.logoPath}
                alt=""
                width={40}
                height={40}
                className="h-full w-full object-contain p-1"
                priority
                unoptimized
              />
            </div>
            <div className="min-w-0 flex-1">
              <Typography
                variant="h6"
                as="span"
                className="font-heading truncate text-base leading-tight font-extrabold sm:text-lg"
              >
                {t("library.title")}
              </Typography>
              <Typography variant="caption2" as="p" color="muted" className="truncate">
                {t("library.eyebrow")}
              </Typography>
            </div>
          </Link>

          <div className="flex items-center gap-1">
            <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
              <Link href={WEB_ROUTES.FIFA_WORLD_CUP}>
                <Iconify icon="lucide:trophy" className="size-4" />
                {t("worldCup.eyebrow")}
              </Link>
            </Button>
            <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
              <Link href={WEB_ROUTES.ISRAEL}>
                <Iconify icon="lucide:star" className="size-4" />
                {t("israel.eyebrow")}
              </Link>
            </Button>

            {CONFIG.isSupabaseConfigured && !isLoading && (
              <AccountButton
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
                {CONFIG.isSupabaseConfigured && isAuthenticated && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href={WEB_ROUTES.PROFILE}>
                        <Iconify icon="lucide:user" className="size-4" />
                        {t("profile.myProfile")}
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href={WEB_ROUTES.FIFA_WORLD_CUP}>
                    <Iconify icon="lucide:trophy" className="size-4" />
                    {t("worldCup.eyebrow")}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={WEB_ROUTES.ISRAEL}>
                    <Iconify icon="lucide:star" className="size-4" />
                    {t("israel.eyebrow")}
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </nav>

      <AppSettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
    </>
  );
}
