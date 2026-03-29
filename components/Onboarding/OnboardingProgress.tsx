"use client";

import { cn } from "@/lib/utils";
import { type OnboardingStep } from "@/hooks/useOnboarding";

interface OnboardingProgressProps {
  currentStep: OnboardingStep;
  currentStepIndex: number;
  totalSteps: number;
  className?: string;
}

// Brand primary color: #345A5D
const BRAND_PRIMARY = "#345A5D";

// Step order for dot display
const STEPS_ORDER: OnboardingStep[] = [
  "welcome",
  "role",
  "artists",
  "task-picker",
  "running",
  "result",
  "recurring",
  "complete",
];

export default function OnboardingProgress({
  currentStepIndex,
  totalSteps,
  className,
}: OnboardingProgressProps) {
  // Calculate progress percentage
  const progressPercentage = ((currentStepIndex + 1) / totalSteps) * 100;

  return (
    <div className={cn("w-full max-w-md mx-auto", className)}>
      {/* Step indicator text */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-muted-foreground">
          Step {currentStepIndex + 1} of {totalSteps}
        </span>
        <span className="text-sm text-muted-foreground">
          {Math.round(progressPercentage)}%
        </span>
      </div>

      {/* Progress bar */}
      <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full transition-all duration-300 ease-out rounded-full"
          style={{
            width: `${progressPercentage}%`,
            backgroundColor: BRAND_PRIMARY,
          }}
        />
      </div>

      {/* Step dots */}
      <div className="flex justify-between mt-3">
        {STEPS_ORDER.map((step, index) => {
          const isCompleted = index < currentStepIndex;
          const isCurrent = index === currentStepIndex;

          return (
            <div
              key={step}
              className={cn(
                "w-2.5 h-2.5 rounded-full transition-all duration-200",
                isCompleted && "scale-100",
                isCurrent && "scale-125 ring-2 ring-offset-2 ring-offset-background",
                !isCompleted && !isCurrent && "bg-muted"
              )}
              style={{
                backgroundColor: isCompleted || isCurrent ? BRAND_PRIMARY : undefined,
                ["--tw-ring-color" as string]: isCurrent ? BRAND_PRIMARY : undefined,
              }}
              aria-label={`Step ${index + 1}: ${step}`}
              aria-current={isCurrent ? "step" : undefined}
            />
          );
        })}
      </div>
    </div>
  );
}
