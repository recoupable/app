export type FirstTaskDecision = "pending" | "confirmed" | "declined";

export type FirstTaskConfirmPhase =
  | "asking"
  | "creating"
  | "scheduled"
  | "declined";

export interface GetFirstTaskConfirmPhaseInput {
  decision: FirstTaskDecision;
  isCreating: boolean;
  hasTask: boolean;
}

/**
 * Confirm-step phase for the onboarding first task (chat#1867). Pure so
 * the decline-never-creates and failed-create-returns-to-asking rules
 * are unit-testable without mounting the mutation hook.
 */
export function getFirstTaskConfirmPhase({
  decision,
  isCreating,
  hasTask,
}: GetFirstTaskConfirmPhaseInput): FirstTaskConfirmPhase {
  if (decision === "declined") return "declined";
  if (hasTask) return "scheduled";
  if (isCreating) return "creating";
  return "asking";
}
