import type { ArtistRecord } from "@/types/Artist";
import { getSpotifyIdFromUrl } from "@/lib/artist/getSpotifyIdFromUrl";

/**
 * The Spotify artist id from a roster artist's connected socials, or null when
 * none is linked. Matches the `spotify.com/artist/{id}` path on any stored
 * form (with or without protocol, with query strings) — this is the id
 * `POST /api/valuation` runs against (chat#1973).
 */
export function getArtistSpotifyId(artist: ArtistRecord): string | null {
  for (const social of artist.account_socials ?? []) {
    const id = getSpotifyIdFromUrl(social.link);
    if (id) return id;
  }
  return null;
}
