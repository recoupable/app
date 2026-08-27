const MESSAGES: Record<string, string> = {
  ARTIST_REQUIRED: "Please select an artist first.",
  // Permanent for wallet/social-only logins: there is no address to deliver
  // to, so "try again" can't succeed.
  EMAIL_REQUIRED:
    "Add an email address to your account to receive your weekly report.",
  AUTH_REQUIRED: "Please sign in to schedule your weekly report.",
};

/**
 * User-facing copy for a failed weekly-report scheduling attempt, keyed by
 * the coded errors `useWeeklyReportTaskInput` throws. Shared by the
 * onboarding confirm and the homepage starter card (chat#2006).
 */
export function getWeeklyReportErrorMessage(error: unknown): string {
  const code = error instanceof Error ? error.message : "";
  return (
    MESSAGES[code] ?? "Couldn't schedule the weekly report. Please try again."
  );
}
