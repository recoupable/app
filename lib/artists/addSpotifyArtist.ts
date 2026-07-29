import type { ArtistRecord } from "@/types/Artist";
import type { SpotifyArtistSearchResult } from "@/types/spotify";
import { createRosterArtist } from "@/lib/artists/createRosterArtist";
import saveArtist from "@/lib/saveArtist";

/**
 * Adds a Spotify-searched artist to the roster. The API resolves-or-creates
 * the canonical artist for the Spotify id and attaches its SPOTIFY social
 * server-side (chat#1889 row 8) — the old client-side profileUrls PATCH is
 * gone, because create-then-attach here is what minted a duplicate artist row
 * per signup.
 *
 * The avatar is written only when the artist was CREATED (201): a reused
 * canonical is shared state, and writing our image onto it would overwrite
 * metadata every other rostering account sees (chat#1866). The image PATCH is
 * non-fatal — the artist is already on the roster (chat#1892).
 */
export async function addSpotifyArtist(
  accessToken: string,
  artist: SpotifyArtistSearchResult,
  orgId?: string | null,
): Promise<ArtistRecord> {
  const { artist: rosterArtist, created } = await createRosterArtist(
    accessToken,
    artist.name,
    orgId,
    artist.id,
  );

  const imageUrl = artist.images?.[0]?.url;
  if (!created || !imageUrl) return rosterArtist;

  try {
    const { artist: updated } = await saveArtist(accessToken, rosterArtist.account_id, {
      image: imageUrl,
    });
    return updated ?? rosterArtist;
  } catch {
    return rosterArtist;
  }
}
