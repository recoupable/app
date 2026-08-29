import { trackEvent } from "@/lib/analytics/trackEvent";
import type { UpgradePlan, UpgradeTrigger } from "@/lib/upgrade/types";

/** `upgrade_prompt_clicked { plan, trigger }`, on the plan button. */
export function trackUpgradePromptClicked(args: {
  trigger: UpgradeTrigger;
  plan: UpgradePlan;
}): void {
  trackEvent("upgrade_prompt_clicked", { plan: args.plan, trigger: args.trigger });
}
