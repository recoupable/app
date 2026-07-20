import { getClientApiBaseUrl } from "@/lib/api/getClientApiBaseUrl";

interface AlbumSearchResponse {
  albums?: { items?: Array<{ images?: Array<{ url?: string }> }> };
}

/**
 * Best-effort album artwork lookup via the Recoup API's public Spotify search
 * (GET /api/spotify/search). Artwork isn't persisted with catalog songs, so
 * the report resolves it by album + artist name at render time. Any miss or
 * error returns null and the UI falls back to a placeholder tile.
 *
 * @param album - Album title
 * @param artistName - Primary artist name (improves match precision)
 */
export async function getAlbumArtwork(
  album: string,
  artistName?: string,
): Promise<string | null> {
  try {
    const q = artistName
      ? `album:"${album}" artist:"${artistName}"`
      : `album:"${album}"`;
    const params = new URLSearchParams({ q, type: "album", limit: "1" });
    const response = await fetch(
      `${getClientApiBaseUrl()}/api/spotify/search?${params}`,
    );
    if (!response.ok) return null;

    const data: AlbumSearchResponse = await response.json();
    return data.albums?.items?.[0]?.images?.[0]?.url ?? null;
  } catch {
    return null;
  }
}
