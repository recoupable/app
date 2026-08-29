import { trackEvent } from "@/lib/analytics/trackEvent";
import type { UpgradePlan, UpgradeTrigger } from "@/lib/upgrade/types";

/** `upgrade_prompt_shown { trigger, plan_offered }`, once per prompt mount. */
export function trackUpgradePromptShown(args: {
  trigger: UpgradeTrigger;
  plans: UpgradePlan[];
}): void {
  trackEvent("upgrade_prompt_shown", {
    trigger: args.trigger,
    plan_offered: args.plans.join(","),
  });
}
