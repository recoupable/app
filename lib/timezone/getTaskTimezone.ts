import { getLocalTimezone } from "./getLocalTimezone";

/**
 * The timezone a task is scheduled in.
 *
 * Reads the optional `timezone` column (added by the sibling api change) off a
 * task-like record, falling back to the viewer's local zone when it's absent —
 * so the edit UI is correct before and after the api ships the column.
 */
export function getTaskTimezone(
  task: Record<string, unknown> & { timezone?: string | null },
): string {
  const timezone = task.timezone;
  return typeof timezone === "string" && timezone ? timezone : getLocalTimezone();
}
