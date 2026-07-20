import type {
  SocialsVerificationState,
  SocialVerdict,
} from "./socialVerificationTypes";

/**
 * Immutably records a confirm/reject verdict for one social on one artist.
 * Any verdict clears a previous explicit "none" — the user is engaging
 * with the matched socials again.
 */
export function applySocialVerdict(
  state: SocialsVerificationState,
  artistId: string,
  socialId: string,
  verdict: SocialVerdict,
): SocialsVerificationState {
  const current = state[artistId] ?? { verdicts: {}, none: false };
  return {
    ...state,
    [artistId]: {
      verdicts: { ...current.verdicts, [socialId]: verdict },
      none: false,
    },
  };
}
