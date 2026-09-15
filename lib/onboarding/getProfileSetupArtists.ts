import type { ArtistRecord } from "@/types/Artist";

/** Resolve selection against the fresh roster so stale profile snapshots cannot gate chat. */
export function getProfileSetupArtists(
  artists: ArtistRecord[],
  selectedArtist?: ArtistRecord | null,
) {
  return selectedArtist
    ? artists.filter(
        (artist) => artist.account_id === selectedArtist.account_id,
      )
    : artists;
}
