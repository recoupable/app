import { formatScheduledActionDate } from "@/lib/utils/formatScheduledActionDate";
import { getTaskNextRun } from "@/lib/tasks/getTaskNextRun";
import type { Task } from "@/lib/tasks/getTasks";

/**
 * The "Next run" line for a task, always a phrase: the next fire time when
 * Trigger has one; otherwise why there is none. Empty `upcoming` is a real
 * state and must read as words, not absence (app#2016 item 1).
 */
export function getTaskNextRunLabel(task: Task): string {
  const nextRun = getTaskNextRun(task);
  if (nextRun) return formatScheduledActionDate(nextRun);
  if (!task.enabled) return "Paused, no upcoming runs";
  if (task.trigger_lookup_failed) return "Schedule unavailable";
  return "Not scheduled";
}
