import { cn } from "@/lib/utils";
import type { OnboardingStep } from "./useOnboarding";

const STEPS: { id: OnboardingStep; label: string }[] = [
  { id: "role", label: "Role" },
  { id: "context", label: "You" },
  { id: "artists", label: "Artists" },
  { id: "connections", label: "Connect" },
  { id: "pulse", label: "Pulse" },
  { id: "tasks", label: "Tasks" },
];

interface Props {
  current: OnboardingStep;
}

/**
 * Visual step progress dots with labels for the onboarding wizard.
 */
export function OnboardingStepDots({ current }: Props) {
  const currentIdx = STEPS.findIndex(s => s.id === current);

  return (
    <div className="flex items-center justify-center gap-0 w-full">
      {STEPS.map((step, i) => {
        const isCompleted = i < currentIdx;
        const isCurrent = i === currentIdx;

        return (
          <div key={step.id} className="flex items-center">
            {/* Dot */}
            <div className="flex flex-col items-center gap-1">
              <div
                className={cn(
                  "h-2 w-2 rounded-full transition-all duration-300",
                  isCompleted
                    ? "bg-primary"
                    : isCurrent
                    ? "bg-primary ring-2 ring-primary/30 h-2.5 w-2.5"
                    : "bg-muted-foreground/25",
                )}
              />
            </div>
            {/* Connector line */}
            {i < STEPS.length - 1 && (
              <div
                className={cn(
                  "h-px w-8 mx-1 transition-all duration-500",
                  i < currentIdx ? "bg-primary" : "bg-muted-foreground/20",
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
