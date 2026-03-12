"use client";

import { useCallback, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useOnboarding, type OnboardingStep } from "./useOnboarding";
import { useOnboardingPersist } from "./useOnboardingPersist";
import { OnboardingWelcomeStep } from "./OnboardingWelcomeStep";
import { OnboardingRoleStep } from "./OnboardingRoleStep";
import { OnboardingContextStep } from "./OnboardingContextStep";
import { OnboardingArtistsStep } from "./OnboardingArtistsStep";
import { OnboardingConnectionsStep } from "./OnboardingConnectionsStep";
import { OnboardingPulseStep } from "./OnboardingPulseStep";
import { OnboardingTasksStep } from "./OnboardingTasksStep";
import { OnboardingCompleteStep } from "./OnboardingCompleteStep";
import { OnboardingStepDots } from "./OnboardingStepDots";

const PROGRESS_STEPS: OnboardingStep[] = ["role", "context", "artists", "connections", "pulse", "tasks"];

/**
 * Onboarding wizard orchestrator.
 * Delegates persistence to useOnboardingPersist and step state to useOnboarding.
 */
export default function OnboardingModal() {
  const { isOpen, step, data, updateData, nextStep, prevStep, complete } = useOnboarding();
  const { persist } = useOnboardingPersist();

  // Persist everything when the tasks (penultimate) step is reached
  useEffect(() => {
    if (step === "tasks") {
      persist(data);
    }
  }, [step]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleComplete = useCallback(async () => {
    await complete();
    const artistNames = (data.artists ?? []).map(a => a.name);
    if (artistNames.length > 0) {
      const q = encodeURIComponent(
        `Give me a complete status report for ${artistNames[0]} — fan breakdown, streaming performance, top opportunities, and my 3 highest-priority actions this week.`,
      );
      setTimeout(() => { window.location.href = `/?q=${q}`; }, 200);
    }
  }, [complete, data.artists]);

  const isProgressStep = PROGRESS_STEPS.includes(step as OnboardingStep);

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent
        className="max-w-lg p-0 gap-0 overflow-hidden [&>button]:hidden"
        onInteractOutside={e => e.preventDefault()}
        onEscapeKeyDown={e => e.preventDefault()}
      >
        {isProgressStep && (
          <div className="flex flex-col gap-3 border-b px-6 pt-4 pb-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-foreground">Recoupable</span>
              <span className="text-xs text-muted-foreground">
                {PROGRESS_STEPS.indexOf(step as OnboardingStep) + 1} of {PROGRESS_STEPS.length}
              </span>
            </div>
            <OnboardingStepDots current={step as Step} />
          </div>
        )}

        <div className={step === "welcome" || step === "complete" ? "px-6 py-8" : "px-6 py-6"}>
          {step === "welcome" && <OnboardingWelcomeStep onDone={nextStep} />}

          {step === "role" && (
            <OnboardingRoleStep
              selected={data.roleType}
              onSelect={v => updateData({ roleType: v })}
              onNext={nextStep}
            />
          )}

          {step === "context" && (
            <OnboardingContextStep
              name={data.name}
              companyName={data.companyName}
              roleType={data.roleType}
              onChangeName={v => updateData({ name: v })}
              onChangeCompany={v => updateData({ companyName: v })}
              onNext={nextStep}
              onBack={prevStep}
            />
          )}

          {step === "artists" && (
            <OnboardingArtistsStep
              artists={data.artists ?? []}
              onUpdate={artists => updateData({ artists })}
              onNext={nextStep}
              onBack={prevStep}
              roleType={data.roleType}
            />
          )}

          {step === "connections" && (
            <OnboardingConnectionsStep
              connected={data.connectedSlugs ?? []}
              onConnect={slug =>
                updateData({ connectedSlugs: [...(data.connectedSlugs ?? []), slug] })
              }
              onNext={nextStep}
              onBack={prevStep}
            />
          )}

          {step === "pulse" && (
            <OnboardingPulseStep
              enabled={data.pulseEnabled ?? false}
              onToggle={v => updateData({ pulseEnabled: v })}
              onNext={nextStep}
              onBack={prevStep}
            />
          )}

          {step === "tasks" && (
            <OnboardingTasksStep
              roleType={data.roleType}
              artistNames={(data.artists ?? []).map(a => a.name)}
              onNext={nextStep}
              onBack={prevStep}
            />
          )}

          {step === "complete" && (
            <OnboardingCompleteStep
              artistNames={(data.artists ?? []).map(a => a.name)}
              name={data.name}
              connectedCount={(data.connectedSlugs ?? []).length}
              pulseEnabled={data.pulseEnabled ?? false}
              onComplete={handleComplete}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
