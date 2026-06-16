import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import Iconify from "@/components/ui/iconify";
import { Typography } from "@/components/ui/typography";
import WEB_ROUTES from "@/constants/web-routes.constants";
import { CONFIG } from "@/lib/app-config";
import { createClient } from "@/lib/supabase/server";
import { contactHref, contactIcon, contactLabel } from "@/lib/album/contact";
import { fetchUserStickers } from "@/lib/album/supabase-sync";
import {
  listPublicProfilesWithStats,
  viewerMissingSet,
  type PublicProfileSummary,
} from "@/lib/album/listings";

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

  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  const viewer = userData.user ?? null;

  let missingSet: Set<string> | undefined;
  if (viewer) {
    const viewerStickers = await fetchUserStickers(supabase, viewer.id);
    missingSet = viewerMissingSet(viewerStickers);
  }

  const summaries = await listPublicProfilesWithStats(supabase, missingSet, viewer?.id);

  const displayed: PublicProfileSummary[] = matchOnly
    ? summaries.filter((s) => s.matchCount > 0)
    : summaries;

  // Sort by best match first, then by completion.
  displayed.sort((a, b) => {
    if (b.matchCount !== a.matchCount) return b.matchCount - a.matchCount;
    return b.album.unique - a.album.unique;
  });

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-10">
      <div className="mb-4 flex items-center justify-between gap-2">
        <Button asChild variant="ghost" size="sm">
          <Link href={WEB_ROUTES.HOME}>
            <Iconify icon="lucide:arrow-left" className="size-4" />
            {t("back")}
          </Link>
        </Button>
      </div>

      <header className="mb-5">
        <Typography variant="h6" as="h1" className="font-heading text-3xl font-black">
          {t("users.title")}
        </Typography>
        <Typography variant="caption2" as="p" color="muted">
          {t("users.subtitle")}
        </Typography>
      </header>

      <div className="mb-5 flex flex-wrap items-center gap-2">
        <Button
          asChild
          variant={!matchOnly ? "default" : "outline"}
          size="sm"
          className="rounded-full"
        >
          <Link href={WEB_ROUTES.USERS}>
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
            <Link href={`${WEB_ROUTES.USERS}?match=1`}>
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
        <ul className="grid gap-3 sm:grid-cols-2">
          {displayed.map((s) => {
            const href = contactHref(s.profile.contact_method, s.profile.contact_value);
            const displayName = s.profile.display_name?.trim() || s.profile.username;
            return (
              <li
                key={s.profile.id}
                className="bg-card relative overflow-hidden rounded-3xl border p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg"
              >
                {s.matchCount > 0 && (
                  <span className="absolute -end-1 -top-1 rounded-tr-3xl rounded-bl-2xl bg-gradient-to-br from-emerald-500 to-sky-500 px-3 py-1 text-[10px] font-black text-white shadow-md">
                    {t("users.matchBadge", { count: s.matchCount })}
                  </span>
                )}

                <div className="flex items-start gap-3">
                  <div className="font-heading flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-sky-500 to-violet-600 text-xl font-black text-white">
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <Typography
                      variant="h6"
                      as="h2"
                      className="font-heading truncate text-base font-extrabold"
                    >
                      {displayName}
                    </Typography>
                    <Typography variant="caption2" as="p" className="text-foreground/60 font-mono">
                      @{s.profile.username}
                    </Typography>
                  </div>
                </div>

                {s.profile.bio && (
                  <Typography variant="caption2" as="p" color="muted" className="mt-2 line-clamp-2">
                    {s.profile.bio}
                  </Typography>
                )}

                <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                  <Stat
                    label={t("share.albumProgress")}
                    value={`${s.album.unique}/${s.album.total}`}
                    sub={`${s.album.percent}%`}
                  />
                  <Stat
                    label={t("share.duplicates")}
                    value={String(s.album.duplicates)}
                    accent="text-amber-600 dark:text-amber-400"
                  />
                  <Stat
                    label={t("users.missingLabel")}
                    value={String(s.album.missing)}
                    accent="text-foreground/70"
                  />
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  <Button asChild size="sm" variant="outline">
                    <Link href={WEB_ROUTES.USER_SHARE(s.profile.username)}>
                      <Iconify icon="lucide:eye" className="size-4" />
                      {t("users.viewCollection")}
                    </Link>
                  </Button>
                  {href && (
                    <Button asChild size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                      <a href={href} target="_blank" rel="noreferrer">
                        <Iconify icon={contactIcon(s.profile.contact_method)} className="size-4" />
                        {t("share.contact", { method: contactLabel(s.profile.contact_method) })}
                      </a>
                    </Button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}

function Stat({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string;
  sub?: string;
  accent?: string;
}) {
  return (
    <div className="bg-muted/30 rounded-xl border px-2 py-1.5">
      <span className="text-foreground/50 block text-[9px] font-bold tracking-wider uppercase">
        {label}
      </span>
      <span className={`block font-mono text-sm font-bold ${accent ?? ""}`}>{value}</span>
      {sub && <span className="text-foreground/50 block text-[10px]">{sub}</span>}
    </div>
  );
}
