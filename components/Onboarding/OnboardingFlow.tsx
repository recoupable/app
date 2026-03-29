"use client";

import { useOnboarding, type OnboardingStep } from "@/hooks/useOnboarding";
import OnboardingProgress from "./OnboardingProgress";
import {
  WelcomeStep,
  RoleStep,
  ArtistsStep,
  TaskPickerStep,
  RunningStep,
  ResultStep,
  RecurringStep,
  CompleteStep,
} from "./steps";

interface StepComponentProps {
  onNext: () => void;
  onBack: () => void;
}

type StepComponent = React.ComponentType<StepComponentProps>;

const STEP_COMPONENTS: Record<OnboardingStep, StepComponent> = {
  welcome: WelcomeStep,
  role: RoleStep,
  artists: ArtistsStep,
  "task-picker": TaskPickerStep,
  running: RunningStep,
  result: ResultStep,
  recurring: RecurringStep,
  complete: CompleteStep,
};

export default function OnboardingFlow() {
  const { step, nextStep, prevStep, currentStepIndex, totalSteps } =
    useOnboarding();

  const StepComponent = STEP_COMPONENTS[step];

  return (
    <div className="flex flex-col items-center min-h-screen py-8 px-4">
      {/* Progress indicator - rendered above step content */}
      <div className="w-full max-w-2xl mb-8">
        <OnboardingProgress
          currentStep={step}
          currentStepIndex={currentStepIndex}
          totalSteps={totalSteps}
        />
      </div>

      {/* Current step content */}
      <div className="w-full max-w-2xl flex-1">
        <StepComponent onNext={nextStep} onBack={prevStep} />
      </div>
    </div>
  );
}
