import { Album } from "./Album";
import { Artist } from "./Artist";
import { AudioBook } from "./AudioBook";
import { Episode } from "./Episodes";
import { Playlist } from "./Playlist";
import { Show } from "./Show";
import { Track } from "./Track";

export type FAN_TYPE = {
  display_name: string | null;
  name: string | null;
  country: string | null;
  city: string | null;
  product: string | null;
  playlist: Array<Playlist> | null;
  episodes: Array<Episode> | null;
  recentlyPlayed: Array<Track> | null;
  followedArtists: Array<Artist> | null;
  savedAlbums: Array<Album> | null;
  savedAudioBooks: Array<AudioBook> | null;
  savedShows: Array<Show> | null;
  savedTracks: Array<Track> | null;
  topTracks: Array<Track> | null;
  topArtists: Array<Artist> | null;
  email: string;
  timestamp: string | null;
};
