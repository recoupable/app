"use client";

import { useCallback, useEffect, useState } from "react";
import { useUserProvider } from "@/providers/UserProvder";

export type OnboardingStep =
  | "welcome"      // Step 0: Animated welcome / research-in-progress on the user
  | "role"         // Step 1: Who are you?
  | "context"      // Step 2: Name, company, vibe
  | "artists"      // Step 3: Priority artists
  | "connections"  // Step 4: Connect key platforms
  | "pulse"        // Step 5: Turn on Pulse
  | "tasks"        // Step 6: Preview auto-generated tasks
  | "complete";    // Step 7: Aha moment reveal

export interface OnboardingArtist {
  name: string;
  spotifyUrl?: string;
}

export interface OnboardingData {
  roleType: string;
  companyName: string;
  name: string;
  artists: OnboardingArtist[];
  connectedSlugs: string[];
  pulseEnabled: boolean;
}

const STEP_ORDER: OnboardingStep[] = [
  "welcome",
  "role",
  "context",
  "artists",
  "connections",
  "pulse",
  "tasks",
  "complete",
];

/**
 * Drives the onboarding wizard.
 * Fires once for new accounts (onboarding_status not completed).
 */
export function useOnboarding() {
  const { userData } = useUserProvider();
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<OnboardingStep>("welcome");
  const [data, setData] = useState<Partial<OnboardingData>>({
    artists: [],
    connectedSlugs: [],
    pulseEnabled: false,
  });

  useEffect(() => {
    if (!userData) return;
    const status = userData.onboarding_status as Record<string, unknown> | null;
    if (!status?.completed) {
      setIsOpen(true);
    }
  }, [userData]);

  const updateData = useCallback((patch: Partial<OnboardingData>) => {
    setData(prev => ({ ...prev, ...patch }));
  }, []);

  const nextStep = useCallback(() => {
    setStep(prev => {
      const idx = STEP_ORDER.indexOf(prev);
      return STEP_ORDER[idx + 1] ?? "complete";
    });
  }, []);

  const complete = useCallback(() => {
    setIsOpen(false);
  }, []);

  return { isOpen, step, data, updateData, nextStep, complete };
}
