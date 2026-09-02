/** The moment that surfaced the upgrade prompt, sent on every prompt event. */
export type UpgradeTrigger =
  | "credits_low"
  | "credits_exhausted"
  | "task_count"
  | "min_cadence";

/** A paid plan checkout can start. */
export type UpgradePlan = "starter" | "pro";

/** The single-card prompt: a big number, its context, a meter, one sentence. */
export interface UpgradeCopy {
  headline: string;
  sub: string;
  /** Meter fill, 0 to 1. */
  ratio: number;
  body: string;
}
