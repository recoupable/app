import type { UpgradeTrigger } from "@/lib/upgrade/types";

const LOW_BALANCE_RATIO = 0.1;

/**
 * Which credit-wall moment an account is in, if any. Null while the credits
 * have not loaded (total 0), so a fresh login never sees a prompt.
 *
 * @param balance - Remaining and monthly total in credits.
 */
export function getCreditsUpgradeTrigger(
  balance: { remaining: number; total: number } | undefined,
): Extract<UpgradeTrigger, "credits_low" | "credits_exhausted"> | null {
  if (!balance || balance.total <= 0) return null;
  if (balance.remaining <= 0) return "credits_exhausted";
  if (balance.remaining / balance.total < LOW_BALANCE_RATIO) return "credits_low";
  return null;
}
