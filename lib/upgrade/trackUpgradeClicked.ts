import { trackEvent } from "@/lib/analytics/trackEvent";
import type { UpgradeTrigger } from "@/lib/upgrade/types";

/**
 * `upgrade_clicked { trigger, account_id }` on the prompt's Upgrade button.
 * The account id joins to the email in Supabase; the email itself never
 * goes to analytics.
 */
export function trackUpgradeClicked(args: { trigger: UpgradeTrigger; accountId: string }): void {
  trackEvent("upgrade_clicked", { trigger: args.trigger, account_id: args.accountId });
}
