import type { Task } from "@/lib/tasks/getTasks";

/**
 * The account's already-scheduled report, if any (chat#1889).
 *
 * `/setup/tasks` pre-ran a fresh report and re-scheduled on every visit, so a
 * returning user (or anyone re-clicking the welcome email's step link) paid for
 * a duplicate run and ended up with a second schedule. When an enabled task
 * already exists, setup should show it instead.
 *
 * An enabled task wins; otherwise a paused one counts too, since "Turn off"
 * pauses the auto-created report (recoupable/app#1941) and setup must not
 * create it again.
 */
export function findExistingWeeklyReportTask(
  tasks: Task[] | undefined,
): Task | null {
  return (
    tasks?.find((task) => task.enabled === true) ??
    tasks?.find((task) => task.enabled === false) ??
    null
  );
}
