const WEB_ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  SIGNUP: "/signup",
  AUTH_CALLBACK: "/auth/callback",
  PROFILE: "/profile",
  USER_SHARE: (username: string) => `/u/${username}`,
} as const;

export default WEB_ROUTES;
