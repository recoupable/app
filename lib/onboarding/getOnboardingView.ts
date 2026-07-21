import type { OnboardingStep } from "@/lib/onboarding/types";

export type OnboardingView = "none" | "sequence" | "checklist";

interface GetOnboardingViewParams {
  /** True once artists, catalogs and tasks have all resolved. */
  isReady: boolean;
  step: OnboardingStep;
  /** User pressed "skip for now" this session. */
  skipped: boolean;
}

/**
 * Soft-gate decision for the chat home (recoupable/chat#1867): incomplete
 * accounts resume the sequence by default; skip drops to the app with the
 * checklist pinned as a persistent reminder (no dismiss); activated accounts
 * (and unresolved state, so the sequence never flashes) see the normal app.
 */
export function getOnboardingView({
  isReady,
  step,
  skipped,
}: GetOnboardingViewParams): OnboardingView {
  if (!isReady || step === "complete") return "none";
  return skipped ? "checklist" : "sequence";
}
