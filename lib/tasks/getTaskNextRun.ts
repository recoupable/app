interface TaskNextRunSource {
  /** Legacy column: nothing has written it since the Trigger.dev migration (2025-11-04); ignored. */
  next_run: string | null;
  /** Upcoming fire times from the Trigger.dev schedule (enriched by GET /api/tasks). */
  upcoming?: string[];
}

/**
 * The next time a task will fire: the first entry of Trigger's `upcoming`
 * (a run's payload list, or the schedule's next fire before the first run,
 * api#859). `scheduled_actions.next_run` is a dead column carrying stale
 * pre-Trigger dates on 58 rows, so it is deliberately not consulted
 * (chat#2006 item 6).
 */
export function getTaskNextRun(task: TaskNextRunSource): string | null {
  return task.upcoming?.[0] ?? null;
}
