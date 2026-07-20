"use client";

import { useOnboardingSessionFlags } from "@/hooks/useOnboardingSessionFlags";
import { useOnboardingState } from "@/hooks/useOnboardingState";
import { getOnboardingView } from "@/lib/onboarding/getOnboardingView";
import type { OnboardingView } from "@/lib/onboarding/getOnboardingView";
import type {
  OnboardingCheckpoint,
  OnboardingStep,
} from "@/lib/onboarding/types";
import { useUserProvider } from "@/providers/UserProvder";

export interface OnboardingGate {
  view: OnboardingView;
  step: OnboardingStep;
  checkpoints: OnboardingCheckpoint[];
  skip: () => void;
  resume: () => void;
  dismissChecklist: () => void;
}

/**
 * Soft gate for the chat home: derived onboarding state + session-scoped
 * skip controls. Single source of truth for the gate — mount it once (in
 * `HomePage`) and pass the callbacks down; skip/dismiss are account-scoped
 * session escape hatches, never persisted server-side
 * (recoupable/chat#1867).
 */
export function useOnboardingGate(): OnboardingGate {
  const { userData } = useUserProvider();
  const { isReady, step, checkpoints } = useOnboardingState();
  const { skipped, checklistDismissed, skip, resume, dismissChecklist } =
    useOnboardingSessionFlags(userData?.account_id ?? "");

  return {
    view: getOnboardingView({ isReady, step, skipped, checklistDismissed }),
    step,
    checkpoints,
    skip,
    resume,
    dismissChecklist,
  };
}
