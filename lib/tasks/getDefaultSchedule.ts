const WEEKLY_MINUTES = 10080;
const WEEKLY_MONDAY_9AM = "0 9 * * 1";
const DAILY_9AM = "0 9 * * *";

/**
 * Cron for a freshly created task, chosen so the create call passes the
 * account's plan gate: weekly when the plan's fastest cadence is weekly,
 * daily otherwise (including when the api reports no cadence).
 */
export function getDefaultSchedule(minCadenceMinutes: number | undefined): string {
  return minCadenceMinutes !== undefined && minCadenceMinutes >= WEEKLY_MINUTES
    ? WEEKLY_MONDAY_9AM
    : DAILY_9AM;
}
