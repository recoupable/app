export interface SpotifyArtistResult {
  id: string;
  name: string;
  imageUrl: string | null;
  profileUrl: string;
  followers: number | null;
}

interface RawSpotifyArtist {
  id?: unknown;
  name?: unknown;
  external_urls?: { spotify?: unknown };
  followers?: { total?: unknown };
  images?: Array<{ url?: unknown }>;
}

/**
 * Maps the `GET /api/spotify/search?type=artist` envelope
 * (`{ artists: { items: [...] } }`) to the flat shape the artist-search UI
 * renders. Spotify returns images largest-first, so the first is the avatar.
 * Items without an id or name are dropped; malformed input yields [].
 */
export function parseSpotifyArtistResults(
  json: unknown,
): SpotifyArtistResult[] {
  const items = (json as { artists?: { items?: unknown } })?.artists?.items;
  if (!Array.isArray(items)) return [];

  return items.flatMap((raw: RawSpotifyArtist) => {
    const id = typeof raw?.id === "string" ? raw.id : null;
    const name = typeof raw?.name === "string" ? raw.name : null;
    if (!id || !name) return [];

    const spotifyUrl = raw.external_urls?.spotify;
    const firstImage = raw.images?.[0]?.url;
    const followers = raw.followers?.total;

    return [
      {
        id,
        name,
        imageUrl: typeof firstImage === "string" ? firstImage : null,
        profileUrl:
          typeof spotifyUrl === "string"
            ? spotifyUrl
            : `https://open.spotify.com/artist/${id}`,
        followers: typeof followers === "number" ? followers : null,
      },
    ];
  });
}
