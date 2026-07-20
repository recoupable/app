import type { SocialsVerificationState } from "./socialVerificationTypes";

/**
 * Immutably records an explicit "this artist has no socials". Resets any
 * per-social verdicts — the explicit none supersedes them.
 */
export function markArtistHasNoSocials(
  state: SocialsVerificationState,
  artistId: string,
): SocialsVerificationState {
  return {
    ...state,
    [artistId]: { verdicts: {}, none: true },
  };
}
