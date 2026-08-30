"use client";

import useCredits from "@/hooks/useCredits";
import { useUpgradePromptDismissed } from "@/hooks/useUpgradePromptDismissed";
import { dismissUpgradePrompt } from "@/lib/upgrade/dismissUpgradePrompt";
import { getCreditsUpgradeTrigger } from "@/lib/upgrade/getCreditsUpgradeTrigger";
import { getUpgradeTriggerCopy } from "@/lib/upgrade/getUpgradeTriggerCopy";

/**
 * The credit-wall prompt's state: which trigger fired (if any), the copy,
 * and the session-scoped dismissal shared by every mounted instance. Pro
 * accounts and dismissed triggers resolve to no prompt.
 */
export function useCreditsUpgradePrompt() {
  const { data } = useCredits();
  const trigger = data?.is_pro
    ? null
    : getCreditsUpgradeTrigger(
        data ? { remaining: data.remaining_credits, total: data.total_credits } : undefined,
      );
  const dismissed = useUpgradePromptDismissed(trigger);

  if (!trigger || !data || dismissed) return { trigger: null } as const;

  return {
    trigger,
    copy: getUpgradeTriggerCopy(trigger, { remaining: data.remaining_credits, total: data.total_credits }),
    dismiss: () => dismissUpgradePrompt(trigger),
  } as const;
}
