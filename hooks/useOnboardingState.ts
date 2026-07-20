"use client";

import { useMemo } from "react";
import { usePrivy } from "@privy-io/react-auth";
import useCatalogs from "@/hooks/useCatalogs";
import { useScheduledActions } from "@/hooks/useScheduledActions";
import { useArtistProvider } from "@/providers/ArtistProvider";
import { getOnboardingCheckpoints } from "@/lib/onboarding/getOnboardingCheckpoints";
import { getOnboardingStep } from "@/lib/onboarding/getOnboardingStep";
import type {
  OnboardingCheckpoint,
  OnboardingStep,
} from "@/lib/onboarding/types";

export interface OnboardingState {
  /** True once every checkpoint source resolved for an authenticated user. */
  isReady: boolean;
  step: OnboardingStep;
  checkpoints: OnboardingCheckpoint[];
}

/**
 * Derives onboarding state on every landing from the existing checkpoint
 * sources: the artist roster (with socials), claimed catalogs, and
 * scheduled tasks. No stored cursor (recoupable/chat#1867), so steps
 * completed out-of-band (valuation auto-claim, chat, API) advance the
 * derived step automatically. Composes existing data hooks; auth and the
 * roster come from providers per the hooks convention.
 */
export function useOnboardingState(): OnboardingState {
  const { authenticated } = usePrivy();
  const { artists, isLoading: artistsLoading } = useArtistProvider();
  const catalogsQuery = useCatalogs();
  const tasksQuery = useScheduledActions({});

  const catalogs = catalogsQuery.data?.catalogs;
  const tasks = tasksQuery.data;

  // Failed fetches keep isReady false: the gate fails open to the normal
  // app instead of mis-deriving a step from partial state.
  const isReady =
    authenticated &&
    !artistsLoading &&
    catalogsQuery.isSuccess &&
    tasksQuery.isSuccess;

  return useMemo(() => {
    const state = {
      artists: artists ?? [],
      catalogs: catalogs ?? [],
      tasks: tasks ?? [],
    };

    return {
      isReady,
      step: getOnboardingStep(state),
      checkpoints: getOnboardingCheckpoints(state),
    };
  }, [artists, catalogs, tasks, isReady]);
}
