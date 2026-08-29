import type { UpgradePlan } from "@/lib/upgrade/types";

/** The paid plans above the account's current one, cheapest first. */
export function getOfferedPlansForPlan(plan: "free" | "starter" | "pro"): UpgradePlan[] {
  if (plan === "free") return ["starter", "pro"];
  if (plan === "starter") return ["pro"];
  return [];
}
