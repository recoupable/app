import type { UpgradeCopy, UpgradeTrigger } from "@/lib/upgrade/types";

/**
 * Prompt headline and body for the credit-wall triggers. Names the number the
 * customer just hit, so the prompt reads as a consequence and not as an ad.
 */
export function getUpgradeTriggerCopy(
  trigger: Extract<UpgradeTrigger, "credits_low" | "credits_exhausted">,
  balance: { remainingUsd: string; totalUsd: string },
): UpgradeCopy {
  if (trigger === "credits_exhausted") {
    return {
      title: "You have used this month's credits",
      body: `Free includes ${balance.totalUsd} a month. Agents pause until the next refill unless you move to a paid plan.`,
    };
  }
  return {
    title: `You have ${balance.remainingUsd} left this month`,
    body: `Free includes ${balance.totalUsd} a month, and the next report will use most of what is left. A paid plan keeps agents running.`,
  };
}
