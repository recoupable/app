import { SocialsResponse } from "./Social";
// Spotify Artist Search Result Type
export interface SpotifyArtistSearchResult {
  id: string;
  name: string;
  type: "artist";
  uri: string;
  external_urls: { spotify: string };
  images: { url: string; height: number; width: number }[];
  popularity: number;
  genres: string[];
  followers: { href: string | null; total: number };
}

// Spotify Album Search Result Type
export interface SpotifyAlbumSearchResult {
  id: string;
  name: string;
  type: "album";
  uri: string;
  external_urls: { spotify: string };
  images: { url: string; height: number; width: number }[];
  artists: SpotifyArtistSearchResult[];
  release_date?: string;
}

// Spotify Track Search Result Type
export interface SpotifyTrackSearchResult {
  id: string;
  name: string;
  type: "track";
  uri: string;
  external_urls: { spotify: string };
  album: SpotifyAlbumSearchResult;
  artists: SpotifyArtistSearchResult[];
  duration_ms: number;
  explicit: boolean;
  popularity: number;
  preview_url?: string;
}

// Spotify Playlist Search Result Type
export interface SpotifyPlaylistSearchResult {
  id: string;
  name: string;
  type: "playlist";
  uri: string;
  external_urls: { spotify: string };
  images: { url: string; height: number; width: number }[];
  owner: {
    display_name: string;
    id: string;
    external_urls: { spotify: string };
  };
  description: string;
  public: boolean;
  tracks: { href: string; total: number };
}

// Spotify Show Search Result Type
export interface SpotifyShowSearchResult {
  id: string;
  name: string;
  type: "show";
  uri: string;
  external_urls: { spotify: string };
  images: { url: string; height: number; width: number }[];
  publisher: string;
  description: string;
  total_episodes: number;
}

// Spotify Episode Search Result Type
export interface SpotifyEpisodeSearchResult {
  id: string;
  name: string;
  type: "episode";
  uri: string;
  external_urls: { spotify: string };
  images: { url: string; height: number; width: number }[];
  description: string;
  duration_ms: number;
  release_date: string;
  explicit: boolean;
  audio_preview_url?: string;
}

// Spotify Audiobook Search Result Type
export interface SpotifyAudiobookSearchResult {
  id: string;
  name: string;
  type: "audiobook";
  uri: string;
  external_urls: { spotify: string };
  images: { url: string; height: number; width: number }[];
  publisher: string;
  description: string;
  total_chapters: number;
}

// API Response Type (fully typed)
export interface SpotifySearchResponse {
  artists?: { items: SpotifyArtistSearchResult[]; total: number };
  albums?: { items: SpotifyAlbumSearchResult[]; total: number };
  tracks?: { items: SpotifyTrackSearchResult[]; total: number };
  playlists?: { items: SpotifyPlaylistSearchResult[]; total: number };
  shows?: { items: SpotifyShowSearchResult[]; total: number };
  episodes?: { items: SpotifyEpisodeSearchResult[]; total: number };
  audiobooks?: { items: SpotifyAudiobookSearchResult[]; total: number };
  [key: string]: unknown;
}

export interface SpotifyArtistAlbumsResultUIType {
  status: string;
  href: string;
  next: string;
  previous: string;
  items: SpotifyAlbumSearchResult[];
  limit: number;
  total: number;
  offset: number;
}
export interface SpotifyDeepResearchResultUIType {
  success: boolean;
  artistSocials: SocialsResponse;
}
export interface SpotifyArtistTopTracksResultType {
  tracks: SpotifyTrackSearchResult[];
}

export interface SpotifyTrack {
  artists: {
    external_urls: { spotify: string };
    href: string;
    id: string;
    name: string;
    type: string;
    uri: string;
  }[];
  available_markets: string[];
  disc_number: number;
  duration_ms: number;
  explicit: boolean;
  external_urls: { spotify: string };
  href: string;
  id: string;
  is_playable: boolean;
  linked_from?: {
    external_urls: { spotify: string };
    href: string;
    id: string;
    type: string;
    uri: string;
  };
  restrictions?: { reason: string };
  name: string;
  preview_url: string | null;
  track_number: number;
  type: string;
  uri: string;
  is_local: boolean;
}

export interface SpotifyAlbum {
  album_type: string;
  total_tracks: number;
  available_markets: string[];
  external_urls: { spotify: string };
  href: string;
  id: string;
  images: { url: string; height: number | null; width: number | null }[];
  name: string;
  release_date: string;
  release_date_precision: string;
  restrictions?: { reason: string };
  type: string;
  uri: string;
  artists: {
    external_urls: { spotify: string };
    href: string;
    id: string;
    name: string;
    type: string;
    uri: string;
  }[];
  tracks: {
    href: string;
    limit: number;
    next: string | null;
    offset: number;
    previous: string | null;
    total: number;
    items: SpotifyTrack[];
  };
  copyrights: { text: string; type: string }[];
  external_ids: { isrc?: string; ean?: string; upc?: string };
  genres: string[];
  label: string;
  popularity: number;
}
