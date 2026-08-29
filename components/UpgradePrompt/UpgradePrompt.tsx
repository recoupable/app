"use client";

import { useEffect, useRef } from "react";
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
  // One shown event per distinct prompt state: a credits refetch can move a
  // mounted prompt from credits_low to credits_exhausted, which is a new
  // impression, while ordinary re-renders are not.
  const shownKey = `${trigger}|${plans.join(",")}`;
  const lastShownKey = useRef<string | null>(null);
  useEffect(() => {
    if (lastShownKey.current === shownKey) return;
    lastShownKey.current = shownKey;
    trackUpgradePromptShown({ trigger, plans });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shownKey]);

  const choose = (plan: UpgradePlan) => {
    trackUpgradePromptClicked({ trigger, plan });
    onChoose(plan);
  };

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-base font-semibold">{copy.title}</h2>
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
