import type { OnboardingStep } from "@/lib/onboarding/types";

export type OnboardingView = "none" | "sequence" | "checklist";

interface GetOnboardingViewParams {
  /** True once artists, catalogs and tasks have all resolved. */
  isReady: boolean;
  step: OnboardingStep;
  /** User pressed "skip for now" this session. */
  skipped: boolean;
  /** User dismissed the pinned checklist this session. */
  checklistDismissed: boolean;
}

/**
 * Soft-gate decision for the chat home (recoupable/chat#1867): incomplete
 * accounts resume the sequence by default; skip drops to the app with the
 * checklist pinned; activated accounts (and unresolved state, so the
 * sequence never flashes) see the normal app.
 */
export function getOnboardingView({
  isReady,
  step,
  skipped,
  checklistDismissed,
}: GetOnboardingViewParams): OnboardingView {
  if (!isReady || step === "complete") return "none";
  if (!skipped) return "sequence";
  return checklistDismissed ? "none" : "checklist";
}
