import { Button } from "@/components/ui/button";

interface OnboardingNavButtonsProps {
  onBack: () => void;
  onNext: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
}

/**
 * Reusable back/next navigation row used across onboarding steps.
 */
export function OnboardingNavButtons({
  onBack,
  onNext,
  nextLabel = "Continue →",
  nextDisabled = false,
}: OnboardingNavButtonsProps) {
  return (
    <div className="flex gap-2">
      <Button variant="outline" onClick={onBack} className="w-24">
        ← Back
      </Button>
      <Button onClick={onNext} disabled={nextDisabled} className="flex-1">
        {nextLabel}
      </Button>
    </div>
  );
}
