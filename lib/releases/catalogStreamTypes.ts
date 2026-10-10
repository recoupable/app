import type { ReleaseCase } from "./types";
/** A chart selection from saved catalog metadata, not a Context Engine review case. */
export interface CatalogStreamRelease {
  id: string;
  title: string;
  recordings: { title: string; isrc: string | null }[];
  complete: boolean;
}
export type StreamRelease = ReleaseCase | CatalogStreamRelease;
export interface StreamCatalogSong {
  isrc: string;
  name: string | null;
  album: string | null;
}
