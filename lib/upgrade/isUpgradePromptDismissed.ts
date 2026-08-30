import type { UpgradeTrigger } from "@/lib/upgrade/types";
import { upgradePromptDismissalKey } from "@/lib/upgrade/upgradePromptDismissalKey";

/** Whether "Keep Free" was clicked for this trigger in the current tab session. */
export function isUpgradePromptDismissed(trigger: UpgradeTrigger): boolean {
  try {
    return window.sessionStorage.getItem(upgradePromptDismissalKey(trigger)) === "1";
  } catch {
    return false;
  }
}
