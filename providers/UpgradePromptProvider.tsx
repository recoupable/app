"use client";

import React, { createContext, useContext, useMemo, useState } from "react";
import type { PlanLimitBody } from "@/lib/tasks/planLimitBody";

interface UpgradePromptContextValue {
  /** The last plan cap the api refused, until the prompt is closed. */
  planLimit: PlanLimitBody | null;
  showPlanLimit: (body: PlanLimitBody) => void;
  closePlanLimit: () => void;
}

const UpgradePromptContext = createContext<UpgradePromptContextValue | null>(null);

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

export const useUpgradePromptProvider = (): UpgradePromptContextValue => {
  const context = useContext(UpgradePromptContext);
  if (!context) {
    throw new Error("useUpgradePromptProvider must be used within an UpgradePromptProvider");
  }
  return context;
};
