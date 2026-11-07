export type FirstTaskDecision = "pending" | "confirmed" | "declined";

export type FirstTaskConfirmPhase =
  | "creating"
  | "scheduled"
  | "failed"
  | "declined";

export interface GetFirstTaskConfirmPhaseInput {
  decision: FirstTaskDecision;
  isCreating: boolean;
  hasTask: boolean;
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
}: GetFirstTaskConfirmPhaseInput): FirstTaskConfirmPhase {
  if (decision === "declined") return "declined";
  if (hasTask) return "scheduled";
  if (isCreating || decision === "pending") return "creating";
  return "failed";
}
