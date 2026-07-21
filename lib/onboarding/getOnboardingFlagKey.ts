import type { OnboardingFlag } from "@/lib/onboarding/types";

/**
 * sessionStorage key for a session-scoped onboarding flag, scoped by
 * account id so accounts sharing a tab never inherit each other's
 * skip choice.
 */
export function getOnboardingFlagKey(
  flag: OnboardingFlag,
  accountId: string,
): string {
  return `recoup-onboarding-${flag}:${accountId}`;
}
