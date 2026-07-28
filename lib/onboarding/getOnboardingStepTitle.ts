import type { OnboardingStepId } from "@/lib/onboarding/types";

/**
 * Display title for each activation checkpoint, in the product's flow
 * language. Replaces the placeholder `getOnboardingStepContent` card copy
 * (chat#1889): the steps now render their own real headings inside
 * `/setup/*`, so the only thing still needed centrally is a short label for
 * the read-only checkpoint list.
 */
const STEP_TITLES: Record<OnboardingStepId, string> = {
  artists: "Confirm your artists",
  socials: "Verify socials",
  catalog: "Claim your catalog",
  task: "Schedule your first report",
};

export function getOnboardingStepTitle(step: OnboardingStepId): string {
  return STEP_TITLES[step];
}
