/**
 * Type guard that validates a value is a safe, HTTPS Spotify URL before it's
 * used as a link href or for playback. Rejects non-https schemes and any host
 * outside the spotify.com domain to prevent open-redirect / scheme abuse.
 */
export function isSafeSpotifyUrl(value?: string): value is string {
  if (!value) return false;
  try {
    const url = new URL(value);
    if (url.protocol !== "https:") return false;
    const host = url.hostname;
    return host === "open.spotify.com" || host.endsWith(".spotify.com");
  } catch {
    return false;
  }
}
