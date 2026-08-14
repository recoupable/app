import { getOnboardingFlagKey } from "@/lib/onboarding/getOnboardingFlagKey";
import type { OnboardingFlag } from "@/lib/onboarding/types";

/**
 * Safe sessionStorage read for a session-scoped onboarding flag. Storage
 * access can throw (SSR, denied/partitioned storage); the gate must fail
 * open, so any failure reads as "not set".
 */
export function readOnboardingFlag(
  flag: OnboardingFlag,
  accountId: string,
): boolean {
  try {
    return (
      typeof window !== "undefined" &&
      window.sessionStorage.getItem(getOnboardingFlagKey(flag, accountId)) ===
        "1"
    );
  } catch {
    return false;
  }
}
