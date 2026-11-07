import { useState } from "react";

/**
 * Whether a first-report run will schedule its report, decided once per run
 * (recoupable/app#1941). The automatic create refetches tasks and flips the
 * live `autoCreate`, which must not rewrite the report on screen; a new run
 * (another artist mints a new chat) decides again.
 *
 * @param runKey - Identifies the run, e.g. its chat id; undefined until known.
 * @param autoCreate - The live decision from the setup step.
 * @returns The decision captured when this run started.
 */
export function useReportRunDecision(
  runKey: string | undefined,
  autoCreate: boolean,
): boolean {
  const [run, setRun] = useState({ runKey, autoCreate });
  if (run.runKey !== runKey) {
    setRun({ runKey, autoCreate });
    return autoCreate;
  }
  return run.autoCreate;
}
