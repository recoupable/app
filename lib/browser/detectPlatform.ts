/**
 * Detect platform/social network from URL
 *
 * @param url
 */
export function detectPlatform(url?: string): string {
  if (!url) return "browser";

  const urlLower = url.toLowerCase();

  if (urlLower.includes("instagram")) return "instagram";
  if (urlLower.includes("facebook")) return "facebook";
  if (urlLower.includes("tiktok")) return "tiktok";
  if (urlLower.includes("youtube")) return "youtube";
  if (urlLower.includes("x.com") || urlLower.includes("twitter")) return "x";
  if (urlLower.includes("threads")) return "threads";

  return "browser";
}
