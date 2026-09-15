import type { OnboardingArtistState } from "./types";
import { hasLinkedSocial } from "./hasLinkedSocial";

/** A real profile or an explicit saved acknowledgement resolves this step. */
export function isArtistProfileReviewed(
  artist: OnboardingArtistState,
): boolean {
  return hasLinkedSocial(artist) || artist.profile_unavailable === true;
}
