interface TaskNextRunSource {
  next_run: string | null;
  /** Upcoming fire times from the Trigger.dev schedule (enriched by GET /api/tasks). */
  upcoming?: string[];
}

/**
 * The next time a task will fire. `scheduled_actions.next_run` is only
 * written by a fire, so a task that has never run has null there while
 * Trigger's `upcoming` already knows the real time; a fresh task must not
 * read "Never" (chat#2006 item 6).
 */
export function getTaskNextRun(task: TaskNextRunSource): string | null {
  return task.next_run ?? task.upcoming?.[0] ?? null;
}
