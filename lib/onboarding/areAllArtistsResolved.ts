import { isArtistSocialsResolved } from "./isArtistSocialsResolved";
import type { SocialsVerificationState } from "./socialVerificationTypes";

export interface ArtistSocialIds {
  artistId: string;
  socialIds: string[];
}

/**
 * The socials verification step completes when every rostered artist is
 * resolved (see `isArtistSocialsResolved`). Vacuously true for an empty
 * roster — callers gate the step on having at least one artist.
 */
export function areAllArtistsResolved(
  state: SocialsVerificationState,
  artists: ArtistSocialIds[],
): boolean {
  return artists.every(({ artistId, socialIds }) =>
    isArtistSocialsResolved(state[artistId], socialIds),
  );
}
