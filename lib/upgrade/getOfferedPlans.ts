import type { UpgradePlan } from "@/lib/upgrade/types";

/** Plans the prompt offers, cheapest first. */
export function getOfferedPlans(starterAvailable: boolean): UpgradePlan[] {
  return starterAvailable ? ["starter", "pro"] : ["pro"];
}
