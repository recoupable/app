import { getCronHumanPreview } from "@/lib/tasks/getCronHumanPreview";

export type NextRunDescription =
  | { kind: "timestamp"; value: string }
  | { kind: "cron"; value: string }
  | { kind: "unknown"; value: null };

/**
 * Describes when a task will next run, degrading gracefully.
 *
 * `upcoming` comes from the latest Trigger.dev run payload, so it is empty for
 * any schedule that has not run yet — and empty just as often when the Trigger
 * lookup failed (api-side `trigger_lookup_failed`, chat#1918). Treating that as
 * "nothing is scheduled" under-sold a live schedule to every cold-start signup.
 * The cron on the task is always present and always true, so it is the fallback.
 */
export function describeNextRun({
  schedule,
  upcoming,
}: {
  schedule: string | null;
  upcoming?: string[];
}): NextRunDescription {
  const first = upcoming?.[0];
  if (first) {
    const parsed = new Date(first);
    if (!Number.isNaN(parsed.getTime())) {
      return { kind: "timestamp", value: parsed.toLocaleString() };
    }
  }

  const humanCron = schedule ? getCronHumanPreview(schedule) : null;
  if (humanCron) return { kind: "cron", value: humanCron };

  return { kind: "unknown", value: null };
}
