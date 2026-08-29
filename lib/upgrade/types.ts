/** The moment that surfaced the upgrade prompt, sent on every prompt event. */
export type UpgradeTrigger =
  | "credits_low"
  | "credits_exhausted"
  | "task_count"
  | "min_cadence";

/** A paid plan the prompt can start checkout for. */
export type UpgradePlan = "starter" | "pro";

export interface UpgradeCopy {
  title: string;
  body: string;
}
