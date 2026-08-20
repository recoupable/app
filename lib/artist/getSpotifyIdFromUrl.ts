/**
 * The Spotify artist id from a stored profile url, or null when the url is
 * not a Spotify artist link. Parses the host rather than substring-matching:
 * a lookalike host ("notspotify.com") or a Spotify-shaped path on another
 * site must never mint a runnable id. Accepts any stored form (with or
 * without protocol, with query strings) — socials store normalized urls.
 */
export function getSpotifyIdFromUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    const parsed = new URL(/^[a-z][a-z0-9+.-]*:\/\//i.test(url) ? url : `https://${url}`);
    const host = parsed.hostname.toLowerCase();
    if (host !== "spotify.com" && !host.endsWith(".spotify.com")) return null;
    const match = parsed.pathname.match(/^\/artist\/([A-Za-z0-9]+)/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}
