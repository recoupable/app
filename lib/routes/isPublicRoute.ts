const PUBLIC_ROUTES =
  /^\/artists\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Whether a pathname is a public page: viewable with no account, so the app
 * must not auto-prompt sign-in or render the authed chrome around it.
 * Currently just the public artist profile.
 */
export function isPublicRoute(pathname: string | null): boolean {
  return !!pathname && PUBLIC_ROUTES.test(pathname);
}
