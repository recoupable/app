"use client";

import { useSyncExternalStore } from "react";
import { dismissalListeners } from "@/lib/upgrade/dismissalListeners";
import { isUpgradePromptDismissed } from "@/lib/upgrade/isUpgradePromptDismissed";
import type { UpgradeTrigger } from "@/lib/upgrade/types";

const subscribe = (listener: () => void) => {
  dismissalListeners.add(listener);
  return () => dismissalListeners.delete(listener);
};

/** Whether this trigger's prompt was dismissed in the tab; re-renders on any dismissal. */
export function useUpgradePromptDismissed(trigger: UpgradeTrigger | null): boolean {
  return useSyncExternalStore(
    subscribe,
    () => (trigger ? isUpgradePromptDismissed(trigger) : false),
    () => false,
  );
}
