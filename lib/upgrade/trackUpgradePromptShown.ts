import { trackEvent } from "@/lib/analytics/trackEvent";
import type { UpgradeTrigger } from "@/lib/upgrade/types";

/** `upgrade_prompt_shown { trigger }`, once per distinct prompt state. */
export function trackUpgradePromptShown(args: { trigger: UpgradeTrigger }): void {
  trackEvent("upgrade_prompt_shown", { trigger: args.trigger });
}
