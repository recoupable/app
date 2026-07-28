import type { ArtistRecord } from "@/types/Artist";
import type { SpotifyArtistSearchResult } from "@/types/spotify";
import { createRosterArtist } from "@/lib/artists/createRosterArtist";
import saveArtist from "@/lib/saveArtist";

/**
 * Adds a Spotify-searched artist to the roster with real data: creates the
 * artist by name (`POST /api/artists`, which only accepts a name), then links
 * its Spotify profile URL and avatar image (`PATCH /api/artists/{id}`) so the
 * roster card and reports have the correct image + a Spotify social to enrich.
 *
 * Enrichment is non-fatal. The create has already succeeded by then, so
 * throwing would report failure over an artist that exists and a retry would
 * create a duplicate (chat#1889); the socials are still fixable in the
 * verify-socials step.
 */
export async function addSpotifyArtist(
  accessToken: string,
  artist: SpotifyArtistSearchResult,
  orgId?: string | null,
): Promise<ArtistRecord> {
  const created = await createRosterArtist(accessToken, artist.name, orgId);

  const imageUrl = artist.images?.[0]?.url;
  try {
    const { artist: updated } = await saveArtist(
      accessToken,
      created.account_id,
      {
        ...(imageUrl ? { image: imageUrl } : {}),
        profileUrls: { SPOTIFY: artist.external_urls.spotify },
      },
    );
    return updated ?? created;
  } catch {
    return created;
  }
}
