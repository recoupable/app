"use client";

import { useCallback, useState } from "react";
import { useOnboardingState } from "@/hooks/useOnboardingState";
import { getOnboardingView } from "@/lib/onboarding/getOnboardingView";
import type { OnboardingView } from "@/lib/onboarding/getOnboardingView";
import type {
  OnboardingCheckpoint,
  OnboardingStep,
} from "@/lib/onboarding/types";

// Session-scoped on purpose (recoupable/chat#1867): skip and dismiss are
// escape hatches for the current visit only — the next landing derives
// state fresh and resumes the sequence by default. Never persisted
// server-side (no wizard cursor).
const SKIP_KEY = "recoup-onboarding-skipped";
const DISMISS_KEY = "recoup-onboarding-checklist-dismissed";

const readSessionFlag = (key: string): boolean =>
  typeof window !== "undefined" && window.sessionStorage.getItem(key) === "1";

export interface OnboardingGate {
  view: OnboardingView;
  step: OnboardingStep;
  checkpoints: OnboardingCheckpoint[];
  skip: () => void;
  resume: () => void;
  dismissChecklist: () => void;
}

/** Soft gate for the chat home: derived onboarding state + skip controls. */
export function useOnboardingGate(): OnboardingGate {
  const { isReady, step, checkpoints } = useOnboardingState();
  const [skipped, setSkipped] = useState(() => readSessionFlag(SKIP_KEY));
  const [checklistDismissed, setChecklistDismissed] = useState(() =>
    readSessionFlag(DISMISS_KEY),
  );

  const skip = useCallback(() => {
    window.sessionStorage.setItem(SKIP_KEY, "1");
    setSkipped(true);
  }, []);

  const resume = useCallback(() => {
    window.sessionStorage.removeItem(SKIP_KEY);
    window.sessionStorage.removeItem(DISMISS_KEY);
    setSkipped(false);
    setChecklistDismissed(false);
  }, []);

  const dismissChecklist = useCallback(() => {
    window.sessionStorage.setItem(DISMISS_KEY, "1");
    setChecklistDismissed(true);
  }, []);

  return {
    view: getOnboardingView({ isReady, step, skipped, checklistDismissed }),
    step,
    checkpoints,
    skip,
    resume,
    dismissChecklist,
  };
}
