import { getOnboardingStepPosition } from "@/lib/onboarding/getOnboardingStepPosition";
import type { OnboardingStepId } from "@/lib/onboarding/types";

/**
 * Progress line for a `/setup/*` step, counted against the one shared
 * checkpoint vocabulary (chat#1889). Every step surface renders this instead
 * of its own numbering, so the sequence and the pinned checklist can never
 * disagree about how many steps there are.
 */
const SetupProgress = ({ step }: { step: OnboardingStepId }) => {
  const { number, total } = getOnboardingStepPosition(step);

  return (
    <p className="text-xs text-muted-foreground">
      Step {number} of {total}
    </p>
  );
};

export default SetupProgress;
