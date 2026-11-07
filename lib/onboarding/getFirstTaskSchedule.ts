/**
 * Cron for the onboarding first task and the homepage starter card: monthly,
 * on the date and time the task is created (recoupable/app#1941; decision by
 * Sweets 2026-08-06). Read in local time, which matches the browser timezone
 * the task is created with. The 29th-31st become the 28th, since a cron for
 * day 31 would skip every shorter month.
 *
 * @param now - The creation moment; defaults to the current time.
 */
export function getFirstTaskSchedule(now: Date = new Date()): string {
  return `${now.getMinutes()} ${now.getHours()} ${Math.min(now.getDate(), 28)} * *`;
}
