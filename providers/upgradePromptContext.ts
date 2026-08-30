import { createContext } from "react";
import type { PlanLimitBody } from "@/lib/tasks/planLimitBody";

export interface UpgradePromptContextValue {
  /** The last plan cap the api refused, until the prompt is closed. */
  planLimit: PlanLimitBody | null;
  showPlanLimit: (body: PlanLimitBody) => void;
  closePlanLimit: () => void;
}

export const UpgradePromptContext = createContext<UpgradePromptContextValue | null>(null);
