import { getOnboardingCheckpoints } from "@/lib/onboarding/getOnboardingCheckpoints";
import type {
  OnboardingAccountState,
  OnboardingStep,
} from "@/lib/onboarding/types";

/**
 * Derives the current onboarding step from account state: the first unmet
 * activation checkpoint, or "complete" once all are met. Pure and
 * deterministic by design (recoupable/chat#1867): recomputed on every
 * landing so resume, multi-device, and out-of-band completion are correct
 * for free, with no stored wizard cursor to drift from reality.
 */
export function getOnboardingStep(
  state: OnboardingAccountState,
): OnboardingStep {
  const firstUnmet = getOnboardingCheckpoints(state).find(
    (checkpoint) => !checkpoint.complete,
  );

  return firstUnmet?.id ?? "complete";
}
