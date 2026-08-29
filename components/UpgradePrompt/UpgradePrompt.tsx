"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import UpgradePlanCard from "@/components/UpgradePrompt/UpgradePlanCard";
import { trackUpgradePromptClicked } from "@/lib/upgrade/trackUpgradePromptClicked";
import { trackUpgradePromptShown } from "@/lib/upgrade/trackUpgradePromptShown";
import type { UpgradeCopy, UpgradePlan, UpgradeTrigger } from "@/lib/upgrade/types";

export interface UpgradePromptProps {
  trigger: UpgradeTrigger;
  copy: UpgradeCopy;
  plans: UpgradePlan[];
  onChoose: (plan: UpgradePlan) => void;
  onDismiss: () => void;
}

/**
 * The one upgrade prompt: trigger copy, the plans side by side, and a way
 * to stay on Free. Tracks `upgrade_prompt_shown` once per mount and
 * `upgrade_prompt_clicked` per plan button; the caller decides where it
 * renders (inline card or modal).
 */
const UpgradePrompt = ({ trigger, copy, plans, onChoose, onDismiss }: UpgradePromptProps) => {
  useEffect(() => {
    trackUpgradePromptShown({ trigger, plans });
    // Once per mount: the trigger is fixed for the prompt's lifetime.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const choose = (plan: UpgradePlan) => {
    trackUpgradePromptClicked({ trigger, plan });
    onChoose(plan);
  };

  return (
    <section aria-labelledby="upgrade-prompt-title" className="space-y-4">
      <div>
        <h2 id="upgrade-prompt-title" className="text-base font-semibold">
          {copy.title}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">{copy.body}</p>
      </div>
      <div className={`grid gap-3 ${plans.length > 1 ? "sm:grid-cols-2" : ""}`}>
        {plans.map((plan) => (
          <UpgradePlanCard key={plan} plan={plan} onChoose={choose} />
        ))}
      </div>
      <Button type="button" variant="ghost" size="sm" onClick={onDismiss}>
        Keep Free
      </Button>
    </section>
  );
};

export default UpgradePrompt;
