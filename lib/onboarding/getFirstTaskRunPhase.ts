export type FirstTaskRunPhase = "generating" | "ready" | "error";

export interface GetFirstTaskRunPhaseInput {
  /** AI SDK useChat status: "ready" | "submitted" | "streaming" | "error". */
  status: string;
  hasReport: boolean;
}

/**
 * Pre-run phase for the onboarding first task (chat#1867). "ready"
 * requires a finished stream AND report text — an idle chat before the
 * auto-send fires is still "generating", so the confirm question never
 * shows before the report exists.
 */
export function getFirstTaskRunPhase({
  status,
  hasReport,
}: GetFirstTaskRunPhaseInput): FirstTaskRunPhase {
  if (status === "error") return "error";
  if (status === "ready" && hasReport) return "ready";
  return "generating";
}
