"use client";

import { useArtistProfilePreferences } from "@/hooks/onboarding/useArtistProfilePreferences";
import { useMemo } from "react";
import { usePrivy } from "@privy-io/react-auth";
import useCatalogs from "@/hooks/useCatalogs";
import { useRefreshCatalogsOnLanding } from "@/hooks/useRefreshCatalogsOnLanding";
import { useScheduledActions } from "@/hooks/useScheduledActions";
import { useArtistProvider } from "@/providers/ArtistProvider";
import { deriveOnboardingState } from "@/lib/onboarding/deriveOnboardingState";
import type { DerivedOnboardingState } from "@/lib/onboarding/deriveOnboardingState";

export type OnboardingState = DerivedOnboardingState;

/**
 * Derives onboarding state on every landing from the existing checkpoint
 * sources: the artist roster (with socials), claimed catalogs, and
 * scheduled tasks. No stored cursor (recoupable/chat#1867), so steps
 * completed out-of-band (valuation auto-claim, chat, API) advance the
 * derived step automatically. Composes existing data hooks; auth and the
 * roster come from providers per the hooks convention; the projection
 * itself lives in `deriveOnboardingState` (pure).
 */
export function useOnboardingState(): OnboardingState {
  const { authenticated } = usePrivy();
  const {
    artists,
    isLoading: artistsLoading,
    isError: artistsError,
  } = useArtistProvider();
  const profilePreferences = useArtistProfilePreferences();
  const catalogsQuery = useCatalogs();
  const tasksQuery = useScheduledActions({});
  useRefreshCatalogsOnLanding();

  const catalogs = catalogsQuery.data?.catalogs;
  const catalogsReady = catalogsQuery.isSuccess;
  const tasks = tasksQuery.data;
  const tasksReady = tasksQuery.isSuccess;

  return useMemo(
    () =>
      deriveOnboardingState({
        authenticated,
        artists: artists.map((artist) => ({
          ...artist,
          profile_unavailable: profilePreferences.artistIds.includes(
            artist.account_id,
          ),
        })),
        artistsLoading: artistsLoading || !profilePreferences.isSuccess,
        artistsError: artistsError || profilePreferences.isError,
        catalogs,
        catalogsReady,
        tasks,
        tasksReady,
      }),
    [
      authenticated,
      profilePreferences.artistIds,
      profilePreferences.isSuccess,
      profilePreferences.isError,
      artists,
      artistsLoading,
      artistsError,
      catalogs,
      catalogsReady,
      tasks,
      tasksReady,
    ],
  );
}
