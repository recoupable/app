import { NEW_API_BASE_URL } from "@/lib/consts";

export interface ArtistProfileSocial {
  type: string;
  username: string | null;
  profile_url: string;
}

export interface ArtistProfileSong {
  isrc: string;
  name: string;
  album: string | null;
  artwork_url: string | null;
  plays: number;
  est_value_usd: number;
}

export interface ArtistProfileCatalog {
  id: string;
  name: string;
  song_count: number;
  updated_at: string;
  songs: ArtistProfileSong[];
}

export interface ArtistProfileValuation {
  low: number;
  mid: number;
  high: number;
}

export interface ArtistProfile {
  id: string;
  name: string | null;
  image: string | null;
  socials: ArtistProfileSocial[];
  catalogs: ArtistProfileCatalog[];
  valuation: ArtistProfileValuation | null;
}

/**
 * GET /api/artists/{id}/profile on the Recoup API — the public artist profile.
 * No auth: the endpoint is deliberately unauthenticated, so this is safe to
 * call from a public server component. Cached for 5 minutes via ISR to match
 * the endpoint's own s-maxage.
 *
 * @param artistId - The artist's account id.
 * @returns The profile, or null on 404 (unknown id or not an artist).
 */
async function getArtistProfile(artistId: string): Promise<ArtistProfile | null> {
  const response = await fetch(`${NEW_API_BASE_URL}/api/artists/${artistId}/profile`, {
    next: { revalidate: 300 },
  });

  if (response.status === 404) return null;
  if (!response.ok) {
    throw new Error(`Failed to fetch artist profile: ${response.status}`);
  }

  return response.json();
}

export default getArtistProfile;
