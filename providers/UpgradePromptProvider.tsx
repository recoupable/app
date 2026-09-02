"use client";

import React, { useMemo, useState } from "react";
import type { PlanLimitBody } from "@/lib/tasks/planLimitBody";
import { UpgradePromptContext } from "@/providers/upgradePromptContext";

/** Lets any task write open the plan-limit modal without threading state through the tree. */
export const UpgradePromptProvider = ({ children }: { children: React.ReactNode }) => {
  const [planLimit, setPlanLimit] = useState<PlanLimitBody | null>(null);
  const value = useMemo(
    () => ({
      planLimit,
      showPlanLimit: setPlanLimit,
      closePlanLimit: () => setPlanLimit(null),
    }),
    [planLimit],
  );
  return <UpgradePromptContext.Provider value={value}>{children}</UpgradePromptContext.Provider>;
};
