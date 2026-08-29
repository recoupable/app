"use client";

import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import UpgradePrompt from "@/components/UpgradePrompt/UpgradePrompt";
import { useUpgradeCheckout } from "@/hooks/useUpgradeCheckout";
import { getOfferedPlansForPlan } from "@/lib/upgrade/getOfferedPlansForPlan";
import { getPlanLimitCopy } from "@/lib/upgrade/getPlanLimitCopy";
import { useUpgradePromptProvider } from "@/hooks/useUpgradePromptProvider";

/**
 * The modal the app opens when a task write comes back 402 `plan_limit`:
 * the trigger (task cap or cadence) in the copy, the plans above the
 * current one, Keep Free to close.
 */
const PlanLimitUpgradeModal = () => {
  const { planLimit, closePlanLimit } = useUpgradePromptProvider();
  const { startCheckout } = useUpgradeCheckout();

  if (!planLimit) return null;

  const copy = getPlanLimitCopy(planLimit);

  return (
    <Dialog open onOpenChange={(open) => !open && closePlanLimit()}>
      <DialogContent className="max-w-xl">
        <UpgradePrompt
          trigger={planLimit.limit}
          copy={copy}
          plans={getOfferedPlansForPlan(planLimit.plan)}
          onChoose={(plan) => void startCheckout(plan)}
          onDismiss={closePlanLimit}
          renderTitle={(title) => (
            <DialogTitle className="text-base font-semibold">{title}</DialogTitle>
          )}
          renderBody={(body) => <DialogDescription className="mt-1">{body}</DialogDescription>}
        />
      </DialogContent>
    </Dialog>
  );
};

export default PlanLimitUpgradeModal;
