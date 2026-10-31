/** Render the parsed destination so browsers cannot reinterpret a raw tool URL. */
export function getSafeSpotifyUrl(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.hostname.endsWith(".spotify.com")
      ? url.href
      : undefined;
  } catch {
    return undefined;
  }
}
