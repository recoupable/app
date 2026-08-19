import type { ValuationRun } from "@/lib/runs/getRuns";

/**
 * Poll cadence for the run-status query (chat#1973): keep polling while a run
 * is in flight, stop on any terminal phase (or when the account has never run
 * one) so idle sessions make no background requests.
 */
export function getRunPollInterval(run: ValuationRun | undefined): number | false {
  return run && (run.state === "queued" || run.state === "measuring") ? 5000 : false;
}
