import { dismissalListeners } from "@/lib/upgrade/dismissalListeners";
import type { UpgradeTrigger } from "@/lib/upgrade/types";
import { upgradePromptDismissalKey } from "@/lib/upgrade/upgradePromptDismissalKey";

/** Hides the prompt for this trigger until the tab is closed, on every mounted instance. */
export function dismissUpgradePrompt(trigger: UpgradeTrigger): void {
  try {
    window.sessionStorage.setItem(upgradePromptDismissalKey(trigger), "1");
  } catch {
    // A blocked storage just means the prompt returns on the next page.
  }
  dismissalListeners.forEach((listener) => listener());
}
