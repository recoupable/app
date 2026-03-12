"use client";

import { useCallback, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useOnboarding } from "./useOnboarding";
import { OnboardingWelcomeStep } from "./OnboardingWelcomeStep";
import { OnboardingRoleStep } from "./OnboardingRoleStep";
import { OnboardingContextStep } from "./OnboardingContextStep";
import { OnboardingArtistsStep } from "./OnboardingArtistsStep";
import { OnboardingConnectionsStep } from "./OnboardingConnectionsStep";
import { OnboardingPulseStep } from "./OnboardingPulseStep";
import { OnboardingTasksStep } from "./OnboardingTasksStep";
import { OnboardingCompleteStep } from "./OnboardingCompleteStep";
import { useUserProvider } from "@/providers/UserProvder";
import { useArtistProvider } from "@/providers/ArtistProvider";
import saveArtist from "@/lib/saveArtist";
import { updatePulse } from "@/lib/pulse/updatePulse";
import { useAccessToken } from "@/hooks/useAccessToken";

type Step =
  | "welcome"
  | "role"
  | "context"
  | "artists"
  | "connections"
  | "pulse"
  | "tasks"
  | "complete";

// Steps that show the progress bar
const PROGRESS_STEPS: Step[] = ["role", "context", "artists", "connections", "pulse", "tasks"];

function getProgress(step: Step): number {
  const idx = PROGRESS_STEPS.indexOf(step);
  if (idx === -1) return 0;
  return Math.round(((idx + 1) / PROGRESS_STEPS.length) * 100);
}

function getStepLabel(step: Step): string {
  const idx = PROGRESS_STEPS.indexOf(step);
  if (idx === -1) return "";
  return `${idx + 1} of ${PROGRESS_STEPS.length}`;
}

/**
 * Full onboarding wizard — non-dismissable modal that fires once for new users.
 * Sequence: welcome → role → context → artists → connections → pulse → tasks → complete
 */
export default function OnboardingModal() {
  const { isOpen, step, data, updateData, nextStep, complete } = useOnboarding();
  const { userData } = useUserProvider();
  const { getArtists } = useArtistProvider();
  const accessToken = useAccessToken();

  // When we hit tasks step: create artists, activate pulse, persist onboarding
  useEffect(() => {
    if (step !== "tasks" || !userData?.account_id) return;

    const run = async () => {
      // Create priority artists
      const artistPromises = (data.artists ?? []).map(a =>
        saveArtist({
          name: a.name,
          spotifyUrl: a.spotifyUrl,
          accountId: userData.account_id,
        }).catch(console.error),
      );
      await Promise.allSettled(artistPromises);

      // Activate pulse if user opted in
      if (data.pulseEnabled && accessToken) {
        await updatePulse({ accessToken, active: true }).catch(console.error);
      }

      // Persist role + context + onboarding status
      await fetch("/api/account/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accountId: userData.account_id,
          roleType: data.roleType,
          name: data.name,
          companyName: data.companyName,
          onboardingStatus: {
            completed: true,
            completedAt: new Date().toISOString(),
            steps: {
              role: data.roleType,
              artistCount: (data.artists ?? []).length,
              connectedCount: (data.connectedSlugs ?? []).length,
              pulseEnabled: data.pulseEnabled,
            },
          },
          onboardingData: data,
        }),
      }).catch(console.error);

      // Refresh the artist sidebar
      if (typeof getArtists === "function") {
        await getArtists().catch(console.error);
      }
    };

    run();
  }, [step]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleComplete = useCallback(async () => {
    await complete();
    // Auto-fire a proactive first chat
    const artistNames = (data.artists ?? []).map(a => a.name);
    if (artistNames.length > 0) {
      const q = encodeURIComponent(
        `Give me a complete status report for ${artistNames[0]} — fan breakdown, streaming performance, top opportunities, and my 3 highest-priority actions this week.`,
      );
      setTimeout(() => { window.location.href = `/?q=${q}`; }, 200);
    }
  }, [complete, data.artists]);

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent
        className="max-w-lg p-0 gap-0 overflow-hidden [&>button]:hidden"
        onInteractOutside={e => e.preventDefault()}
        onEscapeKeyDown={e => e.preventDefault()}
      >
        {/* Header */}
        {PROGRESS_STEPS.includes(step as Step) && (
          <>
            <div className="flex items-center justify-between border-b px-6 py-3.5">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-foreground">Recoupable</span>
              </div>
              <span className="text-xs text-muted-foreground">{getStepLabel(step as Step)}</span>
            </div>
            {/* Progress bar */}
            <div className="h-1 w-full bg-muted">
              <div
                className="h-1 bg-primary transition-all duration-500"
                style={{ width: `${getProgress(step as Step)}%` }}
              />
            </div>
          </>
        )}

        {/* Step content */}
        <div className={
          step === "welcome" || step === "complete"
            ? "px-6 py-8"
            : "px-6 py-6"
        }>
          {step === "welcome" && (
            <OnboardingWelcomeStep onDone={nextStep} />
          )}

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
              onChangeName={v => updateData({ name: v })}
              onChangeCompany={v => updateData({ companyName: v })}
              onNext={nextStep}
            />
          )}

          {step === "artists" && (
            <OnboardingArtistsStep
              artists={data.artists ?? []}
              onUpdate={artists => updateData({ artists })}
              onNext={nextStep}
            />
          )}

          {step === "connections" && (
            <OnboardingConnectionsStep
              connected={data.connectedSlugs ?? []}
              onConnect={slug =>
                updateData({ connectedSlugs: [...(data.connectedSlugs ?? []), slug] })
              }
              onNext={nextStep}
            />
          )}

          {step === "pulse" && (
            <OnboardingPulseStep
              enabled={data.pulseEnabled ?? false}
              onToggle={v => updateData({ pulseEnabled: v })}
              onNext={nextStep}
            />
          )}

          {step === "tasks" && (
            <OnboardingTasksStep
              roleType={data.roleType}
              artistNames={(data.artists ?? []).map(a => a.name)}
              onNext={nextStep}
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
