import type { PlanId } from "@/lib/plan/planTable";
import type { UpgradePlan } from "@/lib/upgrade/types";

/** What the plan table and its buttons need to decide what to offer. */
export interface PlanActionProps {
  currentPlan: PlanId;
  starterAvailable: boolean;
  onStartCheckout: (plan: UpgradePlan) => void;
}
