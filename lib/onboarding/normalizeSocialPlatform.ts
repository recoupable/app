/**
 * Chat's legacy link detector spells Apple Music as "APPPLE" while the
 * Recoup API expects "APPLE" (its own detector and the PATCH profileUrls
 * keys both use the correct spelling). Normalize before comparing or
 * sending platform keys to the API.
 */
export function normalizeSocialPlatform(platform: string): string {
  return platform === "APPPLE" ? "APPLE" : platform;
}
