import { formatCreditsAsUsd } from "@/lib/credits/formatCreditsAsUsd";
import type { UpgradeCopy, UpgradeTrigger } from "@/lib/upgrade/types";

/**
 * Prompt content for the credit-wall triggers: the balance is the headline,
 * so the number that opened the prompt is the first thing read.
 */
export function getUpgradeTriggerCopy(
  trigger: Extract<UpgradeTrigger, "credits_low" | "credits_exhausted">,
  balance: { remaining: number; total: number },
): UpgradeCopy {
  const remaining = Math.max(0, balance.remaining);
  const ratio = balance.total > 0 ? Math.min(1, remaining / balance.total) : 0;
  return {
    headline: `${formatCreditsAsUsd(remaining)} left`,
    sub: `of ${formatCreditsAsUsd(balance.total)} this month`,
    ratio,
    body:
      trigger === "credits_exhausted"
        ? "You have used this month's credits. Upgrading keeps every agent running."
        : "Your next report will use most of what is left. Upgrading keeps every agent running.",
  };
}
