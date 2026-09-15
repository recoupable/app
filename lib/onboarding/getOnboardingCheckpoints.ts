import type {
  OnboardingAccountState,
  OnboardingCheckpoint,
} from "@/lib/onboarding/types";
import { hasLinkedSocial } from "@/lib/onboarding/hasLinkedSocial";

/**
 * Evaluates every activation checkpoint predicate against account state
 * (recoupable/chat#1867). Each flag is independent so a checkpoint completed
 * out-of-band (e.g. an artist added via API) reads complete immediately:
 *
 * - artists:  the account has at least one rostered artist
 * - socials:  every rostered artist has at least one linked social
 * - catalog:  the account has claimed at least one catalog
 * - task:     the account has at least one enabled scheduled task
 */
export function getOnboardingCheckpoints(
  state: OnboardingAccountState,
): OnboardingCheckpoint[] {
  const hasArtists = state.artists.length > 0;

  return [
    { id: "artists", complete: hasArtists },
    {
      id: "socials",
      complete: hasArtists && state.artists.every(hasLinkedSocial),
    },
    { id: "catalog", complete: state.catalogs.length > 0 },
    {
      id: "task",
      complete: state.tasks.some((task) => task.enabled === true),
    },
  ];
}
