import type { CreateTaskParams } from "@/lib/tasks/createTask";
import { buildFirstTaskPrompt } from "@/lib/onboarding/buildFirstTaskPrompt";
import { getFirstTaskSchedule } from "@/lib/onboarding/getFirstTaskSchedule";

export interface BuildFirstTaskParamsInput {
  artistName: string;
  artistAccountId: string;
  /** The account's email — where the weekly report is sent. */
  recipientEmail: string;
  catalogName?: string;
  /** IANA zone the Monday 9am cron is interpreted in; omitted = API default. */
  timezone?: string;
}

/**
 * `POST /api/tasks` params for the weekly report task — the onboarding
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
}: BuildFirstTaskParamsInput): Omit<CreateTaskParams, "model"> {
  return {
    title: `Weekly Catalog Report: ${artistName}`,
    prompt: buildFirstTaskPrompt({
      artistName,
      artistAccountId,
      recipientEmail,
      catalogName,
    }),
    schedule: getFirstTaskSchedule(),
    artist_account_id: artistAccountId,
    ...(timezone ? { timezone } : {}),
  };
}
