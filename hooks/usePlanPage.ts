"use client";

import useCredits from "@/hooks/useCredits";
import { useScheduledActions } from "@/hooks/useScheduledActions";
import { useUpgradeCheckout } from "@/hooks/useUpgradeCheckout";
import { countEnabledTasks } from "@/lib/plan/countEnabledTasks";
import { formatRefillDate } from "@/lib/plan/formatRefillDate";
import { getCurrentPlan } from "@/lib/plan/getCurrentPlan";
import { hasStarterCheckout } from "@/lib/plan/hasStarterCheckout";

/** Everything the plan page renders, from the credits and tasks queries. */
export function usePlanPage() {
  const { data: credits, isLoading } = useCredits();
  const { data: tasks } = useScheduledActions({});
  const { startCheckout } = useUpgradeCheckout();

  return {
    isLoading,
    currentPlan: getCurrentPlan(credits),
    refillDate: formatRefillDate(credits?.timestamp),
    credits: { remaining: credits?.remaining_credits ?? 0, total: credits?.total_credits ?? 0 },
    tasks: { enabled: countEnabledTasks(tasks), limit: credits?.task_limit ?? null },
    starterAvailable: hasStarterCheckout(credits),
    startCheckout,
  };
}
