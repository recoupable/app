import type { CreateTaskParams } from "@/lib/tasks/createTask";
import { buildFirstTaskPrompt } from "@/lib/onboarding/buildFirstTaskPrompt";
import { getFirstTaskSchedule } from "@/lib/onboarding/getFirstTaskSchedule";

export interface BuildFirstTaskParamsInput {
  artistName: string;
  artistAccountId: string;
  /** The account's email — where the monthly report is sent. */
  recipientEmail: string;
  catalogName?: string;
  /** IANA zone the cron is interpreted in; omitted = API default. */
  timezone?: string;
  /** Creation moment the monthly schedule is anchored to; defaults to now. */
  now?: Date;
}

/**
 * `POST /api/tasks` params for the monthly report task — the onboarding
 * first task (chat#1867) and the homepage starter card (chat#2006). The
 * prompt is the same builder output the pre-run streamed, so confirming
 * schedules exactly the report the user just read — including the email
 * delivery to the account's address.
 */
export function buildFirstTaskParams({
  artistName,
  artistAccountId,
  recipientEmail,
  catalogName,
  timezone,
  now,
}: BuildFirstTaskParamsInput): Omit<CreateTaskParams, "model"> {
  return {
    title: `Monthly Catalog Report: ${artistName}`,
    prompt: buildFirstTaskPrompt({
      artistName,
      artistAccountId,
      recipientEmail,
      catalogName,
    }),
    schedule: getFirstTaskSchedule(now),
    artist_account_id: artistAccountId,
    ...(timezone ? { timezone } : {}),
  };
}
