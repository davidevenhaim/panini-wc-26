import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import Iconify from "@/components/ui/iconify";
import { Typography } from "@/components/ui/typography";
import WEB_ROUTES from "@/constants/web-routes.constants";
import { CONFIG } from "@/lib/app-config";
import { createClient } from "@/lib/supabase/server";
import { fetchUserStickers } from "@/lib/album/supabase-sync";
import {
  listPublicProfilesWithStats,
  viewerMissingSet,
  type PublicProfileSummary,
} from "@/lib/album/listings";

type Props = {
  /** When true, only profiles with matchCount > 0 are shown. */
  matchOnly: boolean;
  /**
   * Path used to build filter links — `/` for the home page, `/users` for the
   * dedicated route. Filter state stays in `?match=1`.
   */
  basePath: string;
  /** Optional cap so the home page can show a shorter preview. */
  limit?: number;
  /**
   * "top" drops the divider line + uses bottom spacing so it reads as the
   * hero section. "bottom" keeps the border-t separator.
   */
  placement?: "top" | "middle" | "bottom";
};

export async function PublicCollectorsSection({
  matchOnly,
  basePath,
  limit,
  placement = "bottom",
}: Props) {
  const t = await getTranslations();

  if (!CONFIG.isSupabaseConfigured) return null;

  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  const viewer = userData.user ?? null;

  let missingSet: Set<string> | undefined;
  if (viewer) {
    const viewerStickers = await fetchUserStickers(supabase, viewer.id);
    missingSet = viewerMissingSet(viewerStickers);
  }

  const summaries = await listPublicProfilesWithStats(supabase, missingSet, viewer?.id);
  let displayed: PublicProfileSummary[] = matchOnly
    ? summaries.filter((s) => s.matchCount > 0)
    : summaries;

  displayed.sort((a, b) => {
    if (b.matchCount !== a.matchCount) return b.matchCount - a.matchCount;
    return b.album.unique - a.album.unique;
  });

  if (limit) displayed = displayed.slice(0, limit);

  const allHref = basePath;
  const matchHref = `${basePath}${basePath.includes("?") ? "&" : "?"}match=1`;

  const isTop = placement === "top";
  const isMiddle = placement === "middle";

  return (
    <section
      className={
        isTop
          ? "mx-auto w-full max-w-7xl px-4 pt-6 pb-8 sm:px-6 sm:pt-8 lg:px-10"
          : isMiddle
            ? "mt-6 border-t pt-8"
            : "mx-auto w-full max-w-7xl px-4 pb-16 sm:px-6 lg:px-10"
      }
    >
      <div className={isTop || isMiddle ? "" : "border-t pt-8"}>
        <header className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <Typography
              variant="overline"
              as="span"
              className="text-foreground/50 block text-[10px] font-bold tracking-[0.18em] uppercase"
            >
              {t("users.homeEyebrow")}
            </Typography>
            <Typography variant="h6" as="h2" className="font-heading text-2xl font-black">
              {t("users.title")}
            </Typography>
            <Typography variant="caption2" as="p" color="muted">
              {t("users.subtitle")}
            </Typography>
          </div>
          {limit && summaries.length > limit && (
            <Button asChild variant="outline" size="sm">
              <Link href={WEB_ROUTES.USERS}>
                <Iconify icon="lucide:arrow-right" className="size-4" />
                {t("users.viewAll", { count: summaries.length })}
              </Link>
            </Button>
          )}
        </header>

        <div className="mb-5 flex flex-wrap items-center gap-2">
          <Button
            asChild
            variant={!matchOnly ? "default" : "outline"}
            size="sm"
            className="rounded-full"
          >
            <Link href={allHref}>
              <Iconify icon="lucide:users" className="size-4" />
              {t("users.filterAll", { count: summaries.length })}
            </Link>
          </Button>

          {viewer ? (
            <Button
              asChild
              variant={matchOnly ? "default" : "outline"}
              size="sm"
              className="rounded-full"
            >
              <Link href={matchHref}>
                <Iconify icon="lucide:sparkles" className="size-4" />
                {t("users.filterMatch")}
              </Link>
            </Button>
          ) : (
            <Button asChild variant="outline" size="sm" className="rounded-full">
              <Link href={WEB_ROUTES.LOGIN}>
                <Iconify icon="lucide:log-in" className="size-4" />
                {t("users.loginToMatch")}
              </Link>
            </Button>
          )}

          {viewer && (
            <Typography variant="caption2" as="span" color="muted" className="ms-auto">
              {t("users.viewerHint", { missing: missingSet?.size ?? 0 })}
            </Typography>
          )}
        </div>

        {displayed.length === 0 ? (
          <div className="bg-card rounded-3xl border p-8 text-center">
            <Iconify icon="lucide:users" className="text-foreground/30 mx-auto mb-2 size-8" />
            <Typography variant="body2" as="p" color="muted">
              {matchOnly ? t("users.noMatches") : t("users.empty")}
            </Typography>
          </div>
        ) : (
          <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
            {displayed.map((s) => {
              const displayName = s.profile.display_name?.trim() || s.profile.username;
              const initial = displayName.charAt(0).toUpperCase();
              return (
                <li key={s.profile.id}>
                  <Link
                    href={WEB_ROUTES.USER_SHARE(s.profile.username)}
                    className="group flex flex-col items-center gap-1 rounded-2xl p-2 transition-all hover:-translate-y-0.5"
                    aria-label={`${displayName} — ${s.album.unique}/${s.album.total}`}
                  >
                    <div className="relative">
                      {s.profile.avatar_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={s.profile.avatar_url}
                          alt=""
                          referrerPolicy="no-referrer"
                          className="h-16 w-16 rounded-full object-cover shadow-md ring-2 ring-white/60 transition-shadow group-hover:shadow-lg sm:h-20 sm:w-20 dark:ring-white/20"
                        />
                      ) : (
                        <div
                          className="font-heading flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 via-sky-500 to-violet-600 text-2xl font-black text-white shadow-md ring-2 ring-white/60 sm:h-20 sm:w-20 dark:ring-white/20"
                          aria-hidden
                        >
                          {initial}
                        </div>
                      )}
                      <span className="bg-foreground text-background ring-background absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-full px-2 py-0.5 font-mono text-[10px] font-bold tabular-nums shadow-sm ring-2">
                        {s.album.unique}/{s.album.total}
                      </span>
                      {s.matchCount > 0 && (
                        <span
                          className="ring-background absolute -end-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-sky-500 px-1.5 text-[10px] font-black text-white shadow-md ring-2"
                          aria-label={t("users.matchBadge", { count: s.matchCount })}
                        >
                          +{s.matchCount}
                        </span>
                      )}
                    </div>

                    <div className="mt-2 min-w-0 text-center">
                      <p className="truncate text-sm leading-tight font-semibold">{displayName}</p>
                      <p className="text-foreground/60 mt-0.5 font-mono text-[10px] tabular-nums">
                        <span className="text-amber-600 dark:text-amber-400">
                          +{s.album.duplicates}
                        </span>
                        <span className="text-foreground/30 mx-1">·</span>
                        <span>
                          {s.album.missing} {t("users.missingLabel").toLowerCase()}
                        </span>
                      </p>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
