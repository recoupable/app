/**
 * Cron for the onboarding first task and the homepage starter card: monthly,
 * on the date and time the task is created (recoupable/app#1941; decision by
 * Sweets 2026-08-06). Read in local time, which matches the browser timezone
 * the task is created with; `utc` builds it in UTC for when no timezone is
 * known and the API reads the cron in UTC. The 29th-31st become the 28th,
 * since a cron for day 31 would skip every shorter month.
 *
 * @param now - The creation moment; defaults to the current time.
 * @param options - `utc: true` to read the moment in UTC.
 */
export function getFirstTaskSchedule(
  now: Date = new Date(),
  { utc = false }: { utc?: boolean } = {},
): string {
  const minute = utc ? now.getUTCMinutes() : now.getMinutes();
  const hour = utc ? now.getUTCHours() : now.getHours();
  const day = utc ? now.getUTCDate() : now.getDate();
  return `${minute} ${hour} ${Math.min(day, 28)} * *`;
}
