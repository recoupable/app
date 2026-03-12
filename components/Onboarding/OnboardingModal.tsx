"use client";

import { useCallback, useEffect } from "react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { useOnboarding } from "./useOnboarding";
import { OnboardingRoleStep } from "./OnboardingRoleStep";
import { OnboardingContextStep } from "./OnboardingContextStep";
import { OnboardingArtistsStep } from "./OnboardingArtistsStep";
import { OnboardingResearchingStep } from "./OnboardingResearchingStep";
import { OnboardingCompleteStep } from "./OnboardingCompleteStep";
import { useUserProvider } from "@/providers/UserProvder";
import { useArtistProvider } from "@/providers/ArtistProvider";
import saveArtist from "@/lib/saveArtist";

const STEP_TITLES: Record<string, string> = {
  role: "1 of 3",
  context: "2 of 3",
  artists: "3 of 3",
  researching: "",
  complete: "",
};

/**
 * Full-screen onboarding wizard that fires once for new users.
 * Walks through role selection → context → artist setup → research → wow moment.
 */
export default function OnboardingModal() {
  const { isOpen, step, data, updateData, nextStep, complete } = useOnboarding();
  const { userData } = useUserProvider();
  const { getArtists } = useArtistProvider();

  // Persist role + context to account when we reach the artists step
  useEffect(() => {
    if (step !== "artists" || !userData?.account_id) return;
    if (!data.roleType && !data.name) return;

    fetch("/api/account/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        accountId: userData.account_id,
        roleType: data.roleType,
        name: data.name,
        companyName: data.companyName,
      }),
    }).catch(console.error);
  }, [step]); // eslint-disable-line react-hooks/exhaustive-deps

  // When researching starts, actually create artists and persist onboarding_status
  useEffect(() => {
    if (step !== "researching" || !userData?.account_id) return;

    const run = async () => {
      // Create each artist in parallel
      const artistPromises = (data.artists ?? []).map(a =>
        saveArtist({
          name: a.name,
          spotifyUrl: a.spotifyUrl,
          accountId: userData.account_id,
        }).catch(console.error),
      );
      await Promise.allSettled(artistPromises);

      // Mark onboarding complete on account_info
      await fetch("/api/account/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accountId: userData.account_id,
          onboardingStatus: { completed: true, completedAt: new Date().toISOString() },
          onboardingData: data,
        }),
      }).catch(console.error);

      // Refresh artists list in sidebar
      if (typeof getArtists === "function") {
        await getArtists().catch(console.error);
      }
    };

    run();
  }, [step]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleComplete = useCallback(async () => {
    await complete();
    // Kick off a proactive first chat after a short delay
    setTimeout(() => {
      const artistNames = (data.artists ?? []).map(a => a.name);
      if (artistNames.length > 0) {
        const q = encodeURIComponent(
          `Give me a quick status report and top 3 priorities for ${artistNames[0]} this week`,
        );
        window.location.href = `/?q=${q}`;
      }
    }, 300);
  }, [complete, data.artists]);

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent
        className="max-w-lg p-0 gap-0 overflow-hidden [&>button]:hidden"
        onInteractOutside={e => e.preventDefault()}
        onEscapeKeyDown={e => e.preventDefault()}
      >
        {/* Header bar */}
        {STEP_TITLES[step] && (
          <div className="flex items-center justify-between border-b px-6 py-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Welcome to Recoupable</span>
            </div>
            <span className="text-xs text-muted-foreground">{STEP_TITLES[step]}</span>
          </div>
        )}

        {/* Progress bar */}
        {["role", "context", "artists"].includes(step) && (
          <div className="h-1 w-full bg-muted">
            <div
              className="h-1 bg-primary transition-all duration-500"
              style={{
                width:
                  step === "role" ? "33%" : step === "context" ? "66%" : "100%",
              }}
            />
          </div>
        )}

        {/* Step content */}
        <div className="px-6 py-6">
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

          {step === "researching" && (
            <OnboardingResearchingStep
              artistNames={(data.artists ?? []).map(a => a.name)}
              onComplete={nextStep}
            />
          )}

          {step === "complete" && (
            <OnboardingCompleteStep
              artistNames={(data.artists ?? []).map(a => a.name)}
              name={data.name}
              onComplete={handleComplete}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
