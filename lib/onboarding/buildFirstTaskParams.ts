import type { CreateTaskParams } from "@/lib/tasks/createTask";
import { buildFirstTaskPrompt } from "@/lib/onboarding/buildFirstTaskPrompt";
import { getFirstTaskSchedule } from "@/lib/onboarding/getFirstTaskSchedule";

export interface BuildFirstTaskParamsInput {
  artistName: string;
  artistAccountId: string;
  catalogName?: string;
}

/**
 * `POST /api/tasks` params for the onboarding first task (chat#1867).
 * The prompt is the same builder output the pre-run streamed, so
 * confirming schedules exactly the report the user just read.
 */
export function buildFirstTaskParams({
  artistName,
  artistAccountId,
  catalogName,
}: BuildFirstTaskParamsInput): Omit<CreateTaskParams, "model"> {
  return {
    title: `Weekly Catalog Report — ${artistName}`,
    prompt: buildFirstTaskPrompt({ artistName, catalogName }),
    schedule: getFirstTaskSchedule(),
    artist_account_id: artistAccountId,
  };
}
