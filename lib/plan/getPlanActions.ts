import type { PlanId } from "@/lib/plan/planTable";

/** Which buy buttons an account can use: only the plans above its current one. */
export function getPlanActions(args: { currentPlan: PlanId; starterAvailable: boolean }) {
  return {
    starter: args.currentPlan === "free" && args.starterAvailable,
    pro: args.currentPlan !== "pro",
  };
}
