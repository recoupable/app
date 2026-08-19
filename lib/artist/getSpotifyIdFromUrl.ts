/**
 * The Spotify artist id from a stored profile url, or null when the url is
 * not a Spotify artist link. Matches any stored form (with or without
 * protocol, with query strings) — socials store normalized urls.
 */
export function getSpotifyIdFromUrl(url: string | null | undefined): string | null {
  const match = url?.match(/spotify\.com\/artist\/([A-Za-z0-9]+)/);
  return match ? match[1] : null;
}
