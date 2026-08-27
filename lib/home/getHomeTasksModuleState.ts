import type { TaskRunItem } from "@/lib/tasks/getTaskRuns";
import type { Task } from "@/lib/tasks/getTasks";

const MAX_HOME_RUNS = 5;

interface GetHomeTasksModuleStateParams {
  runs: TaskRunItem[] | undefined;
  runsFailed: boolean;
  isLoading: boolean;
  hasArtist: boolean;
  /** The account's enabled weekly task: null = none, undefined = unknown. */
  existingTask: Task | null | undefined;
}

export type HomeTasksModuleState =
  | { view: "hidden" }
  | { view: "runs"; runs: TaskRunItem[] }
  | { view: "scheduled"; task: Task }
  | { view: "starter" };

/**
 * Decides what the homepage tasks module renders: recent runs for accounts
 * with task history, the already-scheduled report for accounts whose task
 * hasn't fired yet, the one-click starter suggestion for fresh accounts
 * with an artist, or nothing while loading / on failure so the homepage
 * never blocks on this module (recoupable/chat#1850, chat#2006).
 *
 * The starter is gated on tasks, not runs: a user who just finished
 * `/setup` has a task and zero runs until Monday, and offering the starter
 * again would schedule a duplicate. An unknown task list hides it too.
 */
export function getHomeTasksModuleState({
  runs,
  runsFailed,
  isLoading,
  hasArtist,
  existingTask,
}: GetHomeTasksModuleStateParams): HomeTasksModuleState {
  if (isLoading || runsFailed || !runs) return { view: "hidden" };

  if (runs.length > 0)
    return { view: "runs", runs: runs.slice(0, MAX_HOME_RUNS) };

  if (!hasArtist || existingTask === undefined) return { view: "hidden" };

  return existingTask
    ? { view: "scheduled", task: existingTask }
    : { view: "starter" };
}
