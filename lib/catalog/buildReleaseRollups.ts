import type { CatalogSong } from "@/lib/catalog/getCatalogSongs";
import type { CatalogSongMeasurement } from "@/lib/catalog/getCatalogMeasurements";

export interface ReleaseRollup {
  /** Album title, or null when the song rows have no album metadata. */
  album: string | null;
  artistNames: string[];
  trackCount: number;
  measuredTrackCount: number;
  streams: number;
}

const UNTITLED_KEY = "\u0000__untitled__";

/**
 * Groups a catalog's songs into per-release (album) rollups joined with the
 * latest play counts by ISRC, sorted by streams descending. Null-safe by
 * design: songs with null album/name and null entries in the artists array
 * must never throw — fresh valuation-claimed catalogs contain such rows
 * (chat#1867).
 */
export function buildReleaseRollups(
  songs: CatalogSong[],
  measurements: CatalogSongMeasurement[],
): ReleaseRollup[] {
  const playcountByIsrc = new Map<string, number>();
  for (const m of measurements ?? []) {
    if (m?.isrc) playcountByIsrc.set(m.isrc, m.playcount ?? 0);
  }

  const rollups = new Map<string, ReleaseRollup>();
  for (const song of songs ?? []) {
    if (!song) continue;
    const album = song.album?.trim() || null;
    const key = album ?? UNTITLED_KEY;

    let rollup = rollups.get(key);
    if (!rollup) {
      rollup = {
        album,
        artistNames: [],
        trackCount: 0,
        measuredTrackCount: 0,
        streams: 0,
      };
      rollups.set(key, rollup);
    }

    rollup.trackCount += 1;
    if (song.isrc && playcountByIsrc.has(song.isrc)) {
      rollup.measuredTrackCount += 1;
      rollup.streams += playcountByIsrc.get(song.isrc) ?? 0;
    }

    const artists = Array.isArray(song.artists) ? song.artists : [];
    for (const artist of artists) {
      const name = artist?.name?.trim();
      if (name && !rollup.artistNames.includes(name)) {
        rollup.artistNames.push(name);
      }
    }
  }

  return [...rollups.values()].sort((a, b) => b.streams - a.streams);
}
