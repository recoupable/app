import { NEW_API_BASE_URL } from "../consts";

interface SpotifyArtist {
  external_urls: {
    spotify: string;
  };
  followers: {
    href: null;
    total: number;
  };
  genres: string[];
  href: string;
  id: string;
  images: Array<{
    url: string;
    height: number;
    width: number;
  }>;
  name: string;
  popularity: number;
  type: string;
  uri: string;
}

interface SpotifySearchResponse {
  status: string;
  artists: {
    href: string;
    limit: number;
    next: string | null;
    offset: number;
    previous: null;
    total: number;
    items: SpotifyArtist[];
  };
}

/**
 * Get Spotify follower count for an artist
 *
 * @param artistName - The name of the artist to search for
 * @returns Promise<number> - The follower count of the first matching artist
 */
export async function getSpotifyFollowers(artistName: string): Promise<number> {
  try {
    const encodedName = encodeURIComponent(artistName);
    const url = `${NEW_API_BASE_URL}/api/spotify/search?q=${encodedName}&type=artist`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const data: SpotifySearchResponse = await response.json();

    if (data.status !== "success" || !data.artists.items.length) {
      throw new Error(`No artists found for "${artistName}"`);
    }

    return data.artists.items[0].followers.total;
  } catch (error) {
    console.error(`Error fetching Spotify followers for "${artistName}":`, error);
    throw error;
  }
}
