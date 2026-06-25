import WEB_ROUTES from "@/constants/web-routes.constants";

/** Absolute share URL for a user's album collection. */
export function buildAlbumShareUrl(username: string, albumSlug: string): string {
  const path = WEB_ROUTES.USER_SHARE(username, albumSlug);
  if (typeof window !== "undefined") {
    return `${window.location.origin}${path}`;
  }
  return path;
}
