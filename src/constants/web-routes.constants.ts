const WEB_ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  SIGNUP: "/signup",
  AUTH_CALLBACK: "/auth/callback",
  PROFILE: "/profile",
  USERS: "/users",
  ISRAEL: "/israel",
  USER_SHARE: (username: string) => `/u/${username}`,
  ALBUM: (slug: string) => `/albums/${slug}`,
  ALBUM_MISSING: (slug: string) => `/albums/${slug}/missing`,
  ALBUM_DUPLICATES: (slug: string) => `/albums/${slug}/duplicates`,
  COLLECTION_FAMILY: (slug: string) => `/collections/${slug}`,
  FIFA_WORLD_CUP: "/collections/fifa-world-cup",
  /** Legacy alias — points to the WC26 album. */
  LEGACY_WC26: "/albums/world-cup-2026",
} as const;

export default WEB_ROUTES;
