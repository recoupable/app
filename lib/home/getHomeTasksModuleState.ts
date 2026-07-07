import type { TaskRunItem } from "@/lib/tasks/getTaskRuns";

const MAX_HOME_RUNS = 5;

interface GetHomeTasksModuleStateParams {
  runs: TaskRunItem[] | undefined;
  runsFailed: boolean;
  isLoading: boolean;
  hasArtist: boolean;
}

export type HomeTasksModuleState =
  | { view: "hidden" }
  | { view: "runs"; runs: TaskRunItem[] }
  | { view: "starter" };

/**
 * Decides what the homepage tasks module renders: recent runs for accounts
 * with task history, the one-click starter suggestion for fresh accounts
 * with an artist, or nothing while loading / on failure so the homepage
 * never blocks on this module (recoupable/chat#1850).
 */
export function getHomeTasksModuleState({
  runs,
  runsFailed,
  isLoading,
  hasArtist,
}: GetHomeTasksModuleStateParams): HomeTasksModuleState {
  if (isLoading || runsFailed || !runs) return { view: "hidden" };

  if (runs.length > 0)
    return { view: "runs", runs: runs.slice(0, MAX_HOME_RUNS) };

  return hasArtist ? { view: "starter" } : { view: "hidden" };
}
