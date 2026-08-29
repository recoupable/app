"use client";

import { toast } from "sonner";
import { useUpgradePromptProvider } from "@/hooks/useUpgradePromptProvider";
import type { PlanLimitError } from "@/lib/tasks/planLimitError";
import { getOfferedPlansForPlan } from "@/lib/upgrade/getOfferedPlansForPlan";

/**
 * What a task write does with a plan limit: open the upgrade modal when a
 * plan above the current one exists, otherwise (a Pro account at the hourly
 * floor) show the api's message, since there is nothing to upgrade to.
 */
export function usePlanLimitHandler() {
  const { showPlanLimit } = useUpgradePromptProvider();

  const handlePlanLimit = (error: PlanLimitError) => {
    if (getOfferedPlansForPlan(error.body.plan).length === 0) {
      toast.error(error.body.message);
      return;
    }
    showPlanLimit(error.body);
  };

  return { handlePlanLimit };
}
