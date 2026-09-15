import type { SOCIAL } from "@/types/Agent";
import type { ArtistRecord } from "@/types/Artist";

/** Collapse repeated relationship rows without losing distinct social profiles. */
export function normalizeArtistRoster(artists: ArtistRecord[]): ArtistRecord[] {
  const roster = new Map<
    string,
    { artist: ArtistRecord; socials: Map<string, SOCIAL> }
  >();

  for (const artist of artists) {
    let entry = roster.get(artist.account_id);
    if (!entry) {
      entry = { artist, socials: new Map() };
      roster.set(artist.account_id, entry);
    }

    for (const social of artist.account_socials ?? []) {
      if (!entry.socials.has(social.id)) entry.socials.set(social.id, social);
    }
  }

  // Keep the API's first-seen ordering and metadata; never mutate its response.
  return Array.from(roster.values(), ({ artist, socials }) => ({
    ...artist,
    account_socials: Array.from(socials.values()),
  }));
}
