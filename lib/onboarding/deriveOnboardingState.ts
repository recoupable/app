import { getOnboardingCheckpoints } from "@/lib/onboarding/getOnboardingCheckpoints";
import { getOnboardingStep } from "@/lib/onboarding/getOnboardingStep";
import type {
  OnboardingArtistState,
  OnboardingCheckpoint,
  OnboardingStep,
  OnboardingTaskState,
} from "@/lib/onboarding/types";

export interface DeriveOnboardingStateInput {
  authenticated: boolean;
  artists: ReadonlyArray<OnboardingArtistState> | undefined;
  artistsLoading: boolean;
  artistsError: boolean;
  catalogs: ReadonlyArray<unknown> | undefined;
  catalogsReady: boolean;
  tasks: ReadonlyArray<OnboardingTaskState> | undefined;
  tasksReady: boolean;
}

export interface DerivedOnboardingState {
  /** True once every checkpoint source resolved for an authenticated user. */
  isReady: boolean;
  step: OnboardingStep;
  checkpoints: OnboardingCheckpoint[];
}

/**
 * Pure projection of the checkpoint sources into onboarding state.
 * A loading or errored source keeps `isReady` false, so the gate fails
 * open to the normal app instead of mis-deriving a step from partial
 * state (recoupable/chat#1867).
 */
export function deriveOnboardingState({
  authenticated,
  artists,
  artistsLoading,
  artistsError,
  catalogs,
  catalogsReady,
  tasks,
  tasksReady,
}: DeriveOnboardingStateInput): DerivedOnboardingState {
  const state = {
    artists: artists ?? [],
    catalogs: catalogs ?? [],
    tasks: tasks ?? [],
  };

  return {
    isReady:
      authenticated &&
      !artistsLoading &&
      !artistsError &&
      catalogsReady &&
      tasksReady,
    step: getOnboardingStep(state),
    checkpoints: getOnboardingCheckpoints(state),
  };
}
