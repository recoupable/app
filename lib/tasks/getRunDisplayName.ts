import type { TaskRunItem } from "@/lib/tasks/getTaskRuns";
import { getTaskDisplayName } from "@/lib/tasks/getTaskDisplayName";

/**
 * Display name for a task run row, in preference order (chat#1958):
 * 1. the subject of the email the run sent (what the run actually did),
 * 2. the originating scheduled task's title,
 * 3. the generic per-taskIdentifier label (also the fallback until the api
 *    ships the annotations).
 */
export function getRunDisplayName(
  run: Pick<TaskRunItem, "email_subject" | "title" | "taskIdentifier">,
): string {
  return run.email_subject || run.title || getTaskDisplayName(run.taskIdentifier);
}
