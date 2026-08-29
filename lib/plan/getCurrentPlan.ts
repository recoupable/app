import type { PlanId } from "@/lib/plan/planTable";

/** The account's plan: the api's `plan` when reported, else derived from `is_pro`. */
export function getCurrentPlan(
  credits: { plan?: PlanId; is_pro?: boolean } | undefined,
): PlanId {
  if (!credits) return "free";
  return credits.plan ?? (credits.is_pro ? "pro" : "free");
}
