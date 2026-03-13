import { CatalogSongsResponse } from "./getCatalogSongs";

export type CatalogSongItem = CatalogSongsResponse["songs"][0];

/**
 *
 * @param song
 */
export function isCompleteSong(song: CatalogSongItem): boolean {
  const hasTitle = !!song.name && song.name.trim().length > 0;
  const hasIsrc = !!song.isrc && song.isrc.trim().length > 0;
  const hasAlbum = !!song.album && song.album.trim().length > 0;
  const hasNotes = !!song.notes && song.notes.trim().length > 0;
  const hasArtist = Array.isArray(song.artists)
    ? song.artists.some(a => !!a?.name && a.name.trim().length > 0)
    : false;
  return hasTitle && hasArtist && hasAlbum && hasIsrc && hasNotes;
}
