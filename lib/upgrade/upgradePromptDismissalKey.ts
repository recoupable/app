import type { UpgradeTrigger } from "@/lib/upgrade/types";

/** sessionStorage key for a dismissed prompt; per trigger, per tab session. */
export function upgradePromptDismissalKey(trigger: UpgradeTrigger): string {
  return `recoup_upgrade_prompt_dismissed:${trigger}`;
}
