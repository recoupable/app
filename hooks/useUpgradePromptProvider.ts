"use client";

import { useContext } from "react";
import { UpgradePromptContext, type UpgradePromptContextValue } from "@/providers/upgradePromptContext";

/** The plan-limit prompt state; must run under `UpgradePromptProvider`. */
export const useUpgradePromptProvider = (): UpgradePromptContextValue => {
  const context = useContext(UpgradePromptContext);
  if (!context) {
    throw new Error("useUpgradePromptProvider must be used within an UpgradePromptProvider");
  }
  return context;
};
