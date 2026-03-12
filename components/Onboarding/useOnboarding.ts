"use client";

import { useCallback, useEffect, useState } from "react";
import { useUserProvider } from "@/providers/UserProvder";

export type OnboardingStep =
  | "role"        // Step 1: Who are you? (role picker)
  | "context"     // Step 2: Quick context (name, company, vibe)
  | "artists"     // Step 3: Add your priority artists
  | "researching" // Step 4: AI deep-research in progress (aha moment loading)
  | "complete";   // Step 5: Welcome dashboard reveal

export interface OnboardingData {
  roleType: string;
  companyName: string;
  name: string;
  artists: { name: string; spotifyUrl?: string }[];
}

/**
 * Drives the onboarding wizard state.
 * Shows the flow when a new user hasn't completed onboarding yet
 * (detected via onboarding_status on account_info).
 */
export function useOnboarding() {
  const { userData } = useUserProvider();
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<OnboardingStep>("role");
  const [data, setData] = useState<Partial<OnboardingData>>({});

  // Show onboarding for new users (no onboarding_status set)
  useEffect(() => {
    if (!userData) return;
    const status = userData.onboarding_status as Record<string, unknown> | null;
    if (!status || !status.completed) {
      setIsOpen(true);
    }
  }, [userData]);

  const updateData = useCallback((patch: Partial<OnboardingData>) => {
    setData(prev => ({ ...prev, ...patch }));
  }, []);

  const nextStep = useCallback(() => {
    setStep(prev => {
      const order: OnboardingStep[] = [
        "role",
        "context",
        "artists",
        "researching",
        "complete",
      ];
      const idx = order.indexOf(prev);
      return order[idx + 1] ?? "complete";
    });
  }, []);

  const complete = useCallback(async () => {
    setIsOpen(false);
  }, []);

  return { isOpen, step, data, updateData, nextStep, complete };
}
