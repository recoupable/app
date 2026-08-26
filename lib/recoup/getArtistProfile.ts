import { cache } from "react";
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
 * call from a public server component. Fetched with `no-store` so a write is
 * visible on the next page load (recoupable/app#1984); React `cache()` dedupes
 * the metadata and page calls into one request per render.
 *
 * @param artistId - The artist's account id.
 * @returns The profile, or null on 404 (unknown id or not an artist).
 */
const getArtistProfile = cache(
  async (artistId: string): Promise<ArtistProfile | null> => {
    const response = await fetch(
      `${NEW_API_BASE_URL}/api/artists/${artistId}/profile`,
      {
        cache: "no-store",
      },
    );
    if (response.status === 404) return null;
    if (!response.ok) {
      throw new Error(`Failed to fetch artist profile: ${response.status}`);
    }
    return response.json();
  },
);

export default getArtistProfile;
