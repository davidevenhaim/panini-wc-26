import { notFound } from "next/navigation";
import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import Iconify from "@/components/ui/iconify";
import { AlbumFooter } from "@/features/album/album-footer";
import { Typography } from "@/components/ui/typography";
import WEB_ROUTES from "@/constants/web-routes.constants";
import { CONFIG } from "@/lib/app-config";
import { createClient } from "@/lib/supabase/server";
import {
  fetchProfileById,
  fetchProfileByUsername,
  fetchUserStickers,
} from "@/lib/album/supabase-sync";
import { computeBonusStats } from "@/lib/album/collection";
import {
  albumProgressForQuantities,
  computeSwapMatchesForAlbum,
  groupAlbumDuplicatesBySection,
  groupAlbumMissingBySection,
} from "@/lib/album/album-progress";
import { contactHref, contactIcon, contactLabel } from "@/lib/album/contact";
import { ShareContactActions } from "@/features/profile/share-contact-actions";
import { buildSiteMetadata } from "@/lib/site-metadata";
import { getAlbumBySlug } from "@/collections/catalog";
import { resolveAppLocale } from "@/constants/locale";
import { pickLocalizedText } from "@/utils/localized-text";

type RouteParams = {
  params: Promise<{ username: string }>;
  searchParams: Promise<{ album?: string }>;
};

const MESSAGE_CODE_LIMIT = 60;
const DEFAULT_SHARE_ALBUM_SLUG = "world-cup-2026";

export default async function UserSharePage({ params, searchParams }: RouteParams) {
  const { username } = await params;
  const { album: albumSlugParam } = await searchParams;
  const t = await getTranslations();
  const locale = resolveAppLocale(await getLocale());

  if (!CONFIG.isSupabaseConfigured) notFound();

  const albumSlug = albumSlugParam?.trim() || DEFAULT_SHARE_ALBUM_SLUG;
  const album = getAlbumBySlug(albumSlug);
  if (!album || album.dataStatus === "metadata-only") notFound();

  const supabase = await createClient();
  const profile = await fetchProfileByUsername(supabase, username);
  if (!profile) notFound();

  const quantities = await fetchUserStickers(supabase, profile.id, album.id);
  const stats = albumProgressForQuantities(album, quantities);
  const albumTitle = pickLocalizedText(album.title, locale);
  const label = (text: { en?: string; he?: string }) => pickLocalizedText(text, locale);

  const missing = groupAlbumMissingBySection(album, quantities, label);
  const duplicates = groupAlbumDuplicatesBySection(album, quantities, label);
  const showBonus = album.id === "panini-world-cup-2026";
  const bonus = showBonus ? computeBonusStats(quantities) : null;

  const displayName = profile.display_name?.trim() || profile.username;

  const { data: userData } = await supabase.auth.getUser();
  const viewerUser = userData.user;
  const isOwnProfile = viewerUser?.id === profile.id;
  let matchedCodes: string[] = [];
  let viewerUsername: string | null = null;

  if (viewerUser && !isOwnProfile) {
    const viewerStickers = await fetchUserStickers(supabase, viewerUser.id, album.id);
    matchedCodes = computeSwapMatchesForAlbum(album, quantities, viewerStickers);

    const viewerProfile = await fetchProfileById(supabase, viewerUser.id);
    viewerUsername = viewerProfile?.username ?? null;
  }

  const messageCodes = matchedCodes.slice(0, MESSAGE_CODE_LIMIT);
  const remaining = matchedCodes.length - messageCodes.length;
  const messageLines: string[] = [];
  if (matchedCodes.length > 0) {
    messageLines.push(t("share.message.greeting", { name: displayName }));
    messageLines.push("");
    messageLines.push(t("share.message.intro", { count: matchedCodes.length, album: albumTitle }));
    messageLines.push("");
    messageLines.push(t("share.message.needLine"));
    messageLines.push(
      messageCodes.join(", ") +
        (remaining > 0 ? " " + t("share.message.more", { count: remaining }) : "")
    );
    messageLines.push("");
    messageLines.push(t("share.message.swap"));
    if (viewerUsername) {
      messageLines.push("");
      messageLines.push(t("share.message.signoff", { me: viewerUsername }));
    }
  }
  const prefilledMessage = messageLines.join("\n");

  const matchedSet = new Set(matchedCodes);
  const heroPlainHref = contactHref(profile.contact_method, profile.contact_value);

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 lg:px-10">
      <div className="mb-4 flex items-center justify-between gap-2">
        <Button asChild variant="ghost" size="sm">
          <Link href={WEB_ROUTES.ALBUM(album.slug)}>
            <Iconify icon="lucide:arrow-left" className="size-4" />
            {t("albumLists.backToAlbum")}
          </Link>
        </Button>
      </div>

      <header className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-500 via-sky-500 to-violet-600 p-6 text-white shadow-lg">
        <div className="relative z-10 flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <Typography
              variant="overline"
              as="span"
              className="text-[11px] font-bold tracking-[0.18em] text-white/80 uppercase"
            >
              {t("share.eyebrow", { album: albumTitle })}
            </Typography>
            <Typography
              variant="h6"
              as="h1"
              className="font-heading mt-1 truncate text-3xl font-black"
            >
              {displayName}
            </Typography>
            <Typography variant="caption2" as="p" className="font-mono text-white/85">
              @{profile.username}
            </Typography>
            {profile.bio && (
              <Typography variant="body2" as="p" className="mt-2 max-w-prose text-sm text-white/90">
                {profile.bio}
              </Typography>
            )}
            <div className="mt-3 flex flex-wrap gap-4 text-xs text-white/85">
              <span>
                {t("share.albumProgress")}: <strong>{stats.unique}</strong>/{stats.total} ·{" "}
                {stats.percent}%
              </span>
              <span>
                {t("share.duplicates")}: <strong>{stats.duplicates}</strong>
              </span>
              {bonus && (
                <span>
                  {t("share.bonus")}: <strong>{bonus.unique}</strong>/{bonus.total}
                </span>
              )}
            </div>
          </div>

          {heroPlainHref && matchedCodes.length === 0 ? (
            <Button asChild className="bg-white text-emerald-700 hover:bg-white/90">
              <a href={heroPlainHref} target="_blank" rel="noreferrer">
                <Iconify icon={contactIcon(profile.contact_method)} className="size-4" />
                {t("share.contact", { method: contactLabel(profile.contact_method) })}
              </a>
            </Button>
          ) : !heroPlainHref ? (
            <Typography
              variant="caption2"
              as="span"
              className="rounded-full bg-white/15 px-3 py-1 text-white"
            >
              {t("share.noContact")}
            </Typography>
          ) : null}
        </div>
      </header>

      {matchedCodes.length > 0 && (
        <section
          aria-labelledby="match-heading"
          className="mt-4 overflow-hidden rounded-3xl border-2 border-emerald-500/60 bg-gradient-to-br from-emerald-50 to-sky-50 p-5 shadow-md dark:from-emerald-950/40 dark:to-sky-950/40"
        >
          <div className="flex items-start gap-3">
            <span
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-sky-500 text-white shadow-md"
              aria-hidden
            >
              <Iconify icon="lucide:sparkles" className="size-6" />
            </span>
            <div className="min-w-0 flex-1">
              <Typography
                variant="overline"
                as="span"
                className="text-[10px] font-bold tracking-[0.18em] text-emerald-700 uppercase dark:text-emerald-300"
              >
                {t("share.matchEyebrow")}
              </Typography>
              <Typography
                id="match-heading"
                variant="h6"
                as="h2"
                className="font-heading text-2xl leading-tight font-extrabold"
              >
                {t("share.matchHero", { count: matchedCodes.length })}
              </Typography>
              <Typography variant="caption2" as="p" color="muted" className="mt-1">
                {t("share.matchSubtitle", { name: displayName })}
              </Typography>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-1.5">
            {matchedCodes.slice(0, 50).map((code) => (
              <span
                key={code}
                className="rounded-full bg-emerald-500/15 px-2.5 py-1 font-mono text-[12px] font-bold text-emerald-800 ring-1 ring-emerald-500/30 dark:bg-emerald-400/15 dark:text-emerald-200"
              >
                {code}
              </span>
            ))}
            {matchedCodes.length > 50 && (
              <span className="bg-foreground/10 rounded-full px-2.5 py-1 font-mono text-[12px] font-semibold">
                {t("share.message.more", { count: matchedCodes.length - 50 })}
              </span>
            )}
          </div>

          {heroPlainHref && prefilledMessage ? (
            <div className="mt-4">
              <ShareContactActions
                method={profile.contact_method}
                value={profile.contact_value}
                message={prefilledMessage}
              />
            </div>
          ) : !heroPlainHref ? (
            <Typography variant="caption2" as="p" color="muted" className="mt-3">
              {t("share.noContact")}
            </Typography>
          ) : null}
        </section>
      )}

      <section className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="bg-card rounded-3xl border p-4 shadow-sm">
          <header className="mb-3 flex items-center justify-between">
            <Typography
              variant="overline"
              as="span"
              className="text-foreground/60 text-[10px] font-bold tracking-[0.18em] uppercase"
            >
              <Iconify icon="lucide:square-dashed" className="me-1 inline size-3.5" />
              {t("share.missingTitle")}
            </Typography>
            <span className="text-foreground/60 font-mono text-xs">{stats.missing}</span>
          </header>
          {missing.length === 0 ? (
            <Typography variant="caption2" as="p" color="muted">
              {t("share.missingEmpty")}
            </Typography>
          ) : (
            <ul className="space-y-3">
              {missing.map((bucket) => (
                <li key={bucket.id} className="bg-muted/40 rounded-2xl p-3">
                  <Typography
                    variant="label2"
                    as="span"
                    className="text-foreground/80 block text-xs font-bold"
                  >
                    {bucket.title}{" "}
                    <span className="text-foreground/50 font-mono font-normal">
                      · {bucket.codes.length}
                    </span>
                  </Typography>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {bucket.codes.map((code) => (
                      <span
                        key={code}
                        className="bg-background/80 rounded-full px-2 py-0.5 font-mono text-[11px] font-semibold"
                      >
                        {code}
                      </span>
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-card rounded-3xl border p-4 shadow-sm">
          <header className="mb-3 flex items-center justify-between">
            <Typography
              variant="overline"
              as="span"
              className="text-foreground/60 text-[10px] font-bold tracking-[0.18em] uppercase"
            >
              <Iconify icon="lucide:copy" className="me-1 inline size-3.5" />
              {t("share.duplicatesTitle")}
            </Typography>
            <span className="text-foreground/60 font-mono text-xs">{stats.duplicates}</span>
          </header>
          {duplicates.length === 0 ? (
            <Typography variant="caption2" as="p" color="muted">
              {t("share.duplicatesEmpty")}
            </Typography>
          ) : (
            <ul className="space-y-3">
              {duplicates.map((bucket) => (
                <li key={bucket.id} className="bg-muted/40 rounded-2xl p-3">
                  <Typography
                    variant="label2"
                    as="span"
                    className="text-foreground/80 block text-xs font-bold"
                  >
                    {bucket.title}{" "}
                    <span className="text-foreground/50 font-mono font-normal">
                      · {bucket.codes.length}
                    </span>
                  </Typography>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {bucket.codes.map((code) => {
                      const dup = bucket.counts?.[code] ?? 0;
                      const isMatch = matchedSet.has(code);
                      return (
                        <span
                          key={code}
                          className={
                            isMatch
                              ? "inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2 py-0.5 font-mono text-[11px] font-bold text-emerald-800 ring-1 ring-emerald-500/40 dark:text-emerald-200"
                              : "inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 font-mono text-[11px] font-semibold text-amber-900 dark:bg-amber-900/30 dark:text-amber-200"
                          }
                        >
                          {isMatch && (
                            <Iconify icon="lucide:sparkles" className="size-3" aria-hidden />
                          )}
                          {code}
                          <span
                            className={
                              isMatch
                                ? "rounded-full bg-emerald-500 px-1.5 text-[10px] text-white"
                                : "rounded-full bg-amber-500 px-1.5 text-[10px] text-white"
                            }
                          >
                            +{dup}
                          </span>
                        </span>
                      );
                    })}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <AlbumFooter />
    </main>
  );
}

export async function generateMetadata({ params, searchParams }: RouteParams) {
  const { username } = await params;
  const { album: albumSlugParam } = await searchParams;
  const t = await getTranslations();
  const locale = resolveAppLocale(await getLocale());

  const albumSlug = albumSlugParam?.trim() || DEFAULT_SHARE_ALBUM_SLUG;
  const album = getAlbumBySlug(albumSlug);
  const albumTitle = album ? pickLocalizedText(album.title, locale) : "";

  return buildSiteMetadata({
    title: t("metadata.shareTitle", { username, album: albumTitle }),
    description: t("metadata.shareDescription", { username, album: albumTitle }),
    path: WEB_ROUTES.USER_SHARE(username, album?.slug),
    absoluteTitle: true,
  });
}
