"use client";

import UpgradePromptDialog from "@/components/UpgradePrompt/UpgradePromptDialog";
import { useUpgradeNavigation } from "@/hooks/useUpgradeNavigation";
import { useUpgradePromptProvider } from "@/hooks/useUpgradePromptProvider";
import { getPlanLimitCopy } from "@/lib/upgrade/getPlanLimitCopy";
import type { UpgradeTrigger } from "@/lib/upgrade/types";

/**
 * Opens the shared upsell dialog when a task write returns 402 `plan_limit`.
 */
const PlanLimitUpgradeModal = () => {
  const { planLimit, closePlanLimit } = useUpgradePromptProvider();
  const { upgrade } = useUpgradeNavigation();

  if (!planLimit) return null;

  const onUpgrade = (trigger: UpgradeTrigger) => {
    closePlanLimit();
    upgrade(trigger);
  };

  return (
    <UpgradePromptDialog
      open
      onOpenChange={(open) => !open && closePlanLimit()}
      trigger={planLimit.limit}
      copy={getPlanLimitCopy(planLimit)}
      onUpgrade={onUpgrade}
      onDismiss={closePlanLimit}
    />
  );
};

export default PlanLimitUpgradeModal;
