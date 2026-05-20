"use client";

import { useCallback } from "react";
import { useUserProvider } from "@/providers/UserProvder";
import { useArtistProvider } from "@/providers/ArtistProvider";
import { useAccessToken } from "@/hooks/useAccessToken";
import saveArtist from "@/lib/saveArtist";
import { updatePulse } from "@/lib/pulse/updatePulse";
import type { OnboardingData } from "./useOnboarding";

/**
 * Handles all side-effects when the onboarding wizard completes:
 * - Creates priority artists in the DB
 * - Activates Pulse if the user opted in
 * - Persists role, name, company, and onboarding status to account_info
 * - Refreshes the artist sidebar
 */
export function useOnboardingPersist() {
  const { userData } = useUserProvider();
  const { getArtists } = useArtistProvider();
  const accessToken = useAccessToken();

  const persist = useCallback(
    async (data: Partial<OnboardingData>) => {
      if (!userData?.account_id) return;

      // Create artists in parallel
      const artistPromises = (data.artists ?? []).map(a =>
        saveArtist({
          name: a.name,
          spotifyUrl: a.spotifyUrl,
          accountId: userData.account_id,
        }).catch(console.error),
      );
      await Promise.allSettled(artistPromises);

      // Activate Pulse if opted in
      if (data.pulseEnabled && accessToken) {
        await updatePulse({ accessToken, active: true }).catch(console.error);
      }

      // Persist account info + onboarding status
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

      // Refresh artist sidebar
      if (typeof getArtists === "function") {
        await getArtists().catch(console.error);
      }
    },
    [userData?.account_id, accessToken, getArtists],
  );

  return { persist };
}
