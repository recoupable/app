/**
 * Cron for the onboarding first task: Mondays at 9am — the "get this
 * every Monday?" promise in the confirm step. Matches the homepage
 * starter task cadence (buildStarterTaskParams, chat#1850).
 */
export function getFirstTaskSchedule(): string {
  return "0 9 * * 1";
}
