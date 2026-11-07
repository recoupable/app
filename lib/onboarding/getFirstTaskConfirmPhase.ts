export type FirstTaskDecision = "pending" | "confirmed" | "declined";

export type FirstTaskConfirmPhase =
  | "offer"
  | "creating"
  | "scheduled"
  | "failed"
  | "declined";

export interface GetFirstTaskConfirmPhaseInput {
  decision: FirstTaskDecision;
  isCreating: boolean;
  hasTask: boolean;
  /** False when the account already has an active task: offer, don't create. */
  autoCreate: boolean;
}

/**
 * Phase of the onboarding first task (chat#1867). The task is created
 * automatically once the first report finishes (recoupable/app#1941), so
 * "pending" already reads as creating; "declined" means the user turned the
 * created task off. Pure so the rules are testable without the mutation hook.
 */
export function getFirstTaskConfirmPhase({
  decision,
  isCreating,
  hasTask,
  autoCreate,
}: GetFirstTaskConfirmPhaseInput): FirstTaskConfirmPhase {
  if (decision === "declined") return "declined";
  if (hasTask) return "scheduled";
  if (decision === "pending" && !autoCreate) return "offer";
  if (isCreating || decision === "pending") return "creating";
  return "failed";
}
