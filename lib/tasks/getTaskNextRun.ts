interface TaskNextRunSource {
  /** Upcoming fire times from the Trigger.dev schedule (enriched by GET /api/tasks). */
  upcoming?: string[];
}

/**
 * The next time a task will fire: the first entry of Trigger's `upcoming`
 * (a run's payload list, or the schedule's next fire before the first run,
 * api#859). Trigger.dev is the only source of truth for run timing
 * (chat#2006 item 7).
 */
export function getTaskNextRun(task: TaskNextRunSource): string | null {
  return task.upcoming?.[0] ?? null;
}
