import { getOnboardingFlagKey } from "@/lib/onboarding/getOnboardingFlagKey";
import type { OnboardingFlag } from "@/lib/onboarding/types";

/**
 * Safe sessionStorage write for a session-scoped onboarding flag. Flags
 * are best-effort: when storage access throws (denied/partitioned
 * storage) this no-ops and the in-memory gate state still applies for
 * the current view.
 */
export function writeOnboardingFlag(
  flag: OnboardingFlag,
  accountId: string,
  value: boolean,
): void {
  try {
    const key = getOnboardingFlagKey(flag, accountId);
    if (value) {
      window.sessionStorage.setItem(key, "1");
    } else {
      window.sessionStorage.removeItem(key);
    }
  } catch {
    // Fail open: never crash the home flow over storage access.
  }
}
