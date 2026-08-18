/**
 * Prefixes `https://` on scheme-less URLs. The socials table stores
 * `profile_url` without a scheme (`instagram.com/x`), which an anchor would
 * resolve relative to the current page.
 */
export function ensureAbsoluteUrl(url: string): string {
  if (!url || /^https?:\/\//i.test(url)) return url;
  return `https://${url}`;
}
