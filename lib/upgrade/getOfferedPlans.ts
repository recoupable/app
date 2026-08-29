import type { AccountCredits } from "@/lib/recoup/getAccountCredits";
import { getOfferedPlansForPlan } from "@/lib/upgrade/getOfferedPlansForPlan";
import { hasStarterPlan } from "@/lib/upgrade/hasStarterPlan";
import type { UpgradePlan } from "@/lib/upgrade/types";

/**
 * Plans the credit-wall prompt offers, cheapest first: Pro alone against an
 * api that does not report plans yet, otherwise the plans above the current one.
 */
export function getOfferedPlans(credits: AccountCredits | undefined): UpgradePlan[] {
  if (!hasStarterPlan(credits) || !credits?.plan) return ["pro"];
  return getOfferedPlansForPlan(credits.plan);
}
