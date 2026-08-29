"use client";

import useCredits from "@/hooks/useCredits";
import { useUpgradePromptDismissed } from "@/hooks/useUpgradePromptDismissed";
import { formatCreditsAsUsd } from "@/lib/credits/formatCreditsAsUsd";
import { dismissUpgradePrompt } from "@/lib/upgrade/dismissUpgradePrompt";
import { getCreditsUpgradeTrigger } from "@/lib/upgrade/getCreditsUpgradeTrigger";
import { getOfferedPlans } from "@/lib/upgrade/getOfferedPlans";
import { getUpgradeTriggerCopy } from "@/lib/upgrade/getUpgradeTriggerCopy";

/**
 * The credit-wall prompt's state: which trigger fired (if any), the plans
 * to offer, the copy, and the session-scoped dismissal shared by every
 * mounted instance. Pro accounts, accounts with no plan above theirs, and
 * dismissed triggers resolve to no prompt.
 */
export function useCreditsUpgradePrompt() {
  const { data } = useCredits();
  const trigger = data?.is_pro
    ? null
    : getCreditsUpgradeTrigger(
        data ? { remaining: data.remaining_credits, total: data.total_credits } : undefined,
      );
  const dismissed = useUpgradePromptDismissed(trigger);
  const plans = getOfferedPlans(data);

  if (!trigger || !data || dismissed || plans.length === 0) return { trigger: null } as const;

  return {
    trigger,
    plans,
    copy: getUpgradeTriggerCopy(trigger, {
      remainingUsd: formatCreditsAsUsd(Math.max(0, data.remaining_credits)),
      totalUsd: formatCreditsAsUsd(data.total_credits),
    }),
    dismiss: () => dismissUpgradePrompt(trigger),
  } as const;
}
