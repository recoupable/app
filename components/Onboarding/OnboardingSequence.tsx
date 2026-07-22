"use client";

import OnboardingCheckpointList from "@/components/Onboarding/OnboardingCheckpointList";
import OnboardingStepCard from "@/components/Onboarding/OnboardingStepCard";
import type {
  OnboardingCheckpoint,
  OnboardingStepId,
} from "@/lib/onboarding/types";

interface OnboardingSequenceProps {
  step: OnboardingStepId;
  checkpoints: OnboardingCheckpoint[];
  onSkip: () => void;
}

/**
 * The onboarding sequence container (recoupable/chat#1867): renders the
 * derived current step with overall progress and an always-visible
 * "skip for now" escape hatch — a soft gate, never a wall.
 */
const OnboardingSequence = ({
  step,
  checkpoints,
  onSkip,
}: OnboardingSequenceProps) => {
  const stepNumber = checkpoints.findIndex((c) => c.id === step) + 1;

  return (
    <div className="flex w-full max-w-md flex-1 flex-col justify-center gap-6 px-4 py-8">
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Set up Recoup · step {stepNumber} of {checkpoints.length}
        </p>
        <h2 className="mt-1 text-xl font-semibold text-foreground">
          Finish setting up your account
        </h2>
      </div>
      <OnboardingStepCard step={step} />
      <OnboardingCheckpointList checkpoints={checkpoints} />
      <button
        type="button"
        onClick={onSkip}
        className="self-start text-sm text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
      >
        Skip for now
      </button>
    </div>
  );
};

export default OnboardingSequence;
