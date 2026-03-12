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
import { OnboardingStepDots } from "./OnboardingStepDots";
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

const PROGRESS_STEPS: Step[] = ["role", "context", "artists", "connections", "pulse", "tasks"];

/**
 * Full onboarding wizard — non-dismissable modal that fires once for new users.
 * Flow: welcome → role → context → artists → connections → pulse → tasks → complete
 *
 * Features:
 * - Back navigation on all steps after welcome
 * - Spotify artist search with avatars
 * - Pre-filled name from Privy
 * - Confetti on complete
 * - Framer Motion transitions
 * - Pulse & connectors activated inline
 */
export default function OnboardingModal() {
  const { isOpen, step, data, updateData, nextStep, prevStep, complete } = useOnboarding();
  const { userData } = useUserProvider();
  const { getArtists } = useArtistProvider();
  const accessToken = useAccessToken();

  // When tasks step is reached: persist everything and set up artists + pulse
  useEffect(() => {
    if (step !== "tasks" || !userData?.account_id) return;

    const run = async () => {
      const artistPromises = (data.artists ?? []).map(a =>
        saveArtist({
          name: a.name,
          spotifyUrl: a.spotifyUrl,
          accountId: userData.account_id,
        }).catch(console.error),
      );
      await Promise.allSettled(artistPromises);

      if (data.pulseEnabled && accessToken) {
        await updatePulse({ accessToken, active: true }).catch(console.error);
      }

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

      if (typeof getArtists === "function") {
        await getArtists().catch(console.error);
      }
    };

    run();
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

  const isProgressStep = PROGRESS_STEPS.includes(step as Step);

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent
        className="max-w-lg p-0 gap-0 overflow-hidden [&>button]:hidden"
        onInteractOutside={e => e.preventDefault()}
        onEscapeKeyDown={e => e.preventDefault()}
      >
        {/* Header + step dots */}
        {isProgressStep && (
          <div className="flex flex-col gap-3 border-b px-6 pt-4 pb-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-foreground">Recoupable</span>
              <span className="text-xs text-muted-foreground">
                {PROGRESS_STEPS.indexOf(step as Step) + 1} of {PROGRESS_STEPS.length}
              </span>
            </div>
            <OnboardingStepDots current={step as Step} />
          </div>
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
