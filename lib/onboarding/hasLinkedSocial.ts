import type { OnboardingArtistState } from "@/lib/onboarding/types";

/** Shared by the setup gate and its actionable artist list. */
export function hasLinkedSocial(artist: OnboardingArtistState): boolean {
  return (artist.account_socials?.length ?? 0) > 0;
}
