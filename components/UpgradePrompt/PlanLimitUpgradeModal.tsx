"use client";

import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import UpgradePrompt from "@/components/UpgradePrompt/UpgradePrompt";
import { useUpgradeNavigation } from "@/hooks/useUpgradeNavigation";
import { useUpgradePromptProvider } from "@/hooks/useUpgradePromptProvider";
import { getPlanLimitCopy } from "@/lib/upgrade/getPlanLimitCopy";
import type { UpgradeTrigger } from "@/lib/upgrade/types";

/**
 * The modal the app opens when a task write comes back 402 `plan_limit`: the
 * limit that was hit as the headline, one Upgrade button, Keep Free to close.
 * A bottom sheet under 640px, a centered dialog above.
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
    <Dialog open onOpenChange={(open) => !open && closePlanLimit()}>
      <DialogContent className="max-w-lg gap-0 rounded-xl p-5 max-sm:bottom-3 max-sm:top-auto max-sm:w-[calc(100%-1.5rem)] max-sm:translate-y-0 sm:p-6">
        <UpgradePrompt
          trigger={planLimit.limit}
          copy={getPlanLimitCopy(planLimit)}
          onUpgrade={onUpgrade}
          onDismiss={closePlanLimit}
          renderTitle={(headline) => (
            <DialogTitle className="text-[28px] font-semibold leading-8 tracking-[-0.02em] sm:text-[32px] sm:leading-9">
              {headline}
            </DialogTitle>
          )}
          renderBody={(body) => <DialogDescription className="text-sm text-muted-foreground">{body}</DialogDescription>}
        />
      </DialogContent>
    </Dialog>
  );
};

export default PlanLimitUpgradeModal;
