import {
  SpotifyArtistSearchResult,
  SpotifyAlbumSearchResult,
  SpotifyTrackSearchResult,
  SpotifyPlaylistSearchResult,
  SpotifyShowSearchResult,
  SpotifyEpisodeSearchResult,
  SpotifyAudiobookSearchResult,
} from "@/types/spotify";

// Union type for all Spotify content types
export type SpotifyContent =
  | SpotifyArtistSearchResult
  | SpotifyAlbumSearchResult
  | SpotifyTrackSearchResult
  | SpotifyPlaylistSearchResult
  | SpotifyShowSearchResult
  | SpotifyEpisodeSearchResult
  | SpotifyAudiobookSearchResult;

/**
 * Generates appropriate subtitle text for different Spotify content types
 *
 * @param content - Any Spotify content object (track, artist, album, etc.)
 * @returns Formatted subtitle string based on content type
 */
export const getSpotifySubtitle = (content: SpotifyContent): string => {
  switch (content.type) {
    case "track":
      return content.artists?.map(artist => artist.name).join(", ") || "";
    case "album":
      return content.artists?.map(artist => artist.name).join(", ") || "";
    case "playlist":
      return content.owner?.display_name || "";
    case "show":
      return content.publisher || "";
    case "episode":
      return content.description ? content.description.slice(0, 50) + "..." : "";
    case "audiobook":
      return content.publisher || "";
    case "artist":
      if (content.genres && content.genres.length > 0) {
        return content.genres.slice(0, 2).join(", ");
      }
      return content.followers ? `${content.followers.total.toLocaleString()} followers` : "";
    default:
      return "";
  }
};
