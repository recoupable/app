import type { ArtistRecord } from "@/types/Artist";

/**
 * The Spotify artist id from a roster artist's connected socials, or null when
 * none is linked. Matches the `spotify.com/artist/{id}` path on any stored
 * form (with or without protocol, with query strings) — this is the id
 * `POST /api/valuation` runs against (chat#1973).
 */
export function getArtistSpotifyId(artist: ArtistRecord): string | null {
  for (const social of artist.account_socials ?? []) {
    const match = social.link?.match(/spotify\.com\/artist\/([A-Za-z0-9]+)/);
    if (match) return match[1];
  }
  return null;
}
