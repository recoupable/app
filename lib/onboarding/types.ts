/**
 * Onboarding activation checkpoints, in sequence order. The current step is
 * always DERIVED from account state with these predicates on every landing,
 * never stored as a wizard cursor (recoupable/chat#1867): out-of-band
 * completion (valuation auto-claim, chat, API) can never desync the flow.
 */
export const ONBOARDING_STEP_IDS = [
  "artists",
  "socials",
  "catalog",
  "task",
] as const;

export type OnboardingStepId = (typeof ONBOARDING_STEP_IDS)[number];

export type OnboardingStep = OnboardingStepId | "complete";

/** Minimal structural slice of an `account_artist_ids` roster entry. */
export interface OnboardingArtistState {
  account_socials?: ReadonlyArray<unknown> | null;
}

/** Minimal structural slice of a `scheduled_actions` row. */
export interface OnboardingTaskState {
  enabled?: boolean | null;
}

/** Everything the step derivation needs, sourced from existing tables. */
export interface OnboardingAccountState {
  artists: ReadonlyArray<OnboardingArtistState>;
  catalogs: ReadonlyArray<unknown>;
  tasks: ReadonlyArray<OnboardingTaskState>;
}

export interface OnboardingCheckpoint {
  id: OnboardingStepId;
  complete: boolean;
}
