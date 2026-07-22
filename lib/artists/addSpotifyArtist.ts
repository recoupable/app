import type { ArtistRecord } from "@/types/Artist";
import type { SpotifyArtistResult } from "@/lib/spotify/parseSpotifyArtistResults";
import { createRosterArtist } from "@/lib/artists/createRosterArtist";
import saveArtist from "@/lib/saveArtist";

/**
 * Adds a Spotify-searched artist to the roster with real data: creates the
 * artist by name (`POST /api/artists`), then links its Spotify profile URL and
 * avatar image (`PATCH /api/artists/{id}`) so the roster card and reports have
 * the correct image + a Spotify social to enrich. Reuses the existing endpoints
 * rather than a bespoke create path.
 */
export async function addSpotifyArtist(
  accessToken: string,
  artist: SpotifyArtistResult,
  orgId?: string | null,
): Promise<ArtistRecord> {
  const created = await createRosterArtist(accessToken, artist.name, orgId);

  const { artist: updated } = await saveArtist(
    accessToken,
    created.account_id,
    {
      ...(artist.imageUrl ? { image: artist.imageUrl } : {}),
      profileUrls: { SPOTIFY: artist.profileUrl },
    },
  );

  return updated ?? created;
}
