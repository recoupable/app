"use client";

import { useState } from "react";
import useCredits from "@/hooks/useCredits";
import { formatCreditsAsUsd } from "@/lib/credits/formatCreditsAsUsd";
import { dismissUpgradePrompt } from "@/lib/upgrade/dismissUpgradePrompt";
import { getCreditsUpgradeTrigger } from "@/lib/upgrade/getCreditsUpgradeTrigger";
import { getOfferedPlans } from "@/lib/upgrade/getOfferedPlans";
import { getUpgradeTriggerCopy } from "@/lib/upgrade/getUpgradeTriggerCopy";
import { hasStarterPlan } from "@/lib/upgrade/hasStarterPlan";
import { isUpgradePromptDismissed } from "@/lib/upgrade/isUpgradePromptDismissed";

/**
 * The credit-wall prompt's state: which trigger fired (if any), the plans
 * to offer, the copy, and the session-scoped dismissal. Pro accounts and
 * dismissed triggers resolve to no prompt.
 */
export function useCreditsUpgradePrompt() {
  const { data } = useCredits();
  const [dismissedAt, setDismissedAt] = useState(0);

  const trigger = data?.is_pro
    ? null
    : getCreditsUpgradeTrigger(
        data ? { remaining: data.remaining_credits, total: data.total_credits } : undefined,
      );
  // dismissedAt is read so a dismissal re-renders into the hidden state.
  const dismissed = !!trigger && (dismissedAt > 0 || isUpgradePromptDismissed(trigger));

  if (!trigger || !data || dismissed) return { trigger: null } as const;

  return {
    trigger,
    plans: getOfferedPlans(hasStarterPlan(data)),
    copy: getUpgradeTriggerCopy(trigger, {
      remainingUsd: formatCreditsAsUsd(Math.max(0, data.remaining_credits)),
      totalUsd: formatCreditsAsUsd(data.total_credits),
    }),
    dismiss: () => {
      dismissUpgradePrompt(trigger);
      setDismissedAt(Date.now());
    },
  } as const;
}
