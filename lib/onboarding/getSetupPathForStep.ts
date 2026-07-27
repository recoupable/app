import type { OnboardingStep, OnboardingStepId } from "@/lib/onboarding/types";

/**
 * The canonical `/setup/*` route for each onboarding step (chat#1889).
 * `/setup` is the one onboarding sequence, so every entry point — the welcome
 * email, the catalog-report CTA, the retired `/onboarding/*` mounts, and the
 * authenticated home — resolves a DERIVED step through this map instead of
 * hard-coding a surface. A `Record` keyed by step id (not a partial lookup)
 * so adding a checkpoint is a compile error until it has a destination.
 */
const SETUP_PATHS: Record<OnboardingStepId, string> = {
  artists: "/setup/artists",
  socials: "/setup/socials",
  catalog: "/setup/catalog",
  task: "/setup/tasks",
};

/**
 * Resolves the derived onboarding step to the route that renders it. A
 * "complete" account belongs on the app home, never inside the sequence.
 */
export function getSetupPathForStep(step: OnboardingStep): string {
  return step === "complete" ? "/" : SETUP_PATHS[step];
}
