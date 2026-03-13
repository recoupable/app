import type { ArtistRecord } from "@/types/Artist";

// Constants
export const DEFAULT_ARTIST_IMAGE = "https://i.imgur.com/QCdc8Ai.jpg";

// Helper functions
export const truncateName = (name: string, maxLength = 12) => {
  if (!name) return "";
  return name.length > maxLength ? `${name.substring(0, maxLength)}...` : name;
};

export const getArtistDisplayName = (artist: ArtistRecord | null) => {
  return artist?.name ? truncateName(artist.name) : "";
};

export const sortArtistsAlphabetically = (artists: ArtistRecord[]) => {
  return [...artists].sort((a, b) => {
    const nameA = a.name || "";
    const nameB = b.name || "";
    return nameA.localeCompare(nameB);
  });
};

// Type guards
export const isArtistSelected = (artist: ArtistRecord | null): artist is ArtistRecord => {
  return artist !== null;
};
