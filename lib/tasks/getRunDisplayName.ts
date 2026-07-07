import type { TaskRunItem } from "@/lib/tasks/getTaskRuns";
import { getTaskDisplayName } from "@/lib/tasks/getTaskDisplayName";

/**
 * Display name for a task run row: the originating scheduled task's title
 * when the api resolved one, otherwise the generic per-taskIdentifier label
 * (today's behavior — also the fallback until the api ships titles).
 */
export function getRunDisplayName(
  run: Pick<TaskRunItem, "title" | "taskIdentifier">,
): string {
  return run.title || getTaskDisplayName(run.taskIdentifier);
}
