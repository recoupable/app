import { ONBOARDING_STEP_IDS } from "@/lib/onboarding/types";
import type { OnboardingStepId } from "@/lib/onboarding/types";

export interface OnboardingStepPosition {
  /** 1-indexed position, for display. */
  number: number;
  total: number;
}

/**
 * Where a step sits in the ONE shared checkpoint vocabulary (chat#1889).
 *
 * Both the numerator and the denominator come from `ONBOARDING_STEP_IDS`, so
 * no surface can invent its own count: `RosterSocialsFlow` used to render
 * "Step 1 of 2" from its local flow state while the checklist counted 4, which
 * told the same account two different things about how much was left.
 */
export function getOnboardingStepPosition(
  step: OnboardingStepId,
): OnboardingStepPosition {
  return {
    number: ONBOARDING_STEP_IDS.indexOf(step) + 1,
    total: ONBOARDING_STEP_IDS.length,
  };
}
