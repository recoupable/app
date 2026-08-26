import { createTask } from "@/lib/tasks/createTask";
import type { Task } from "@/lib/tasks/getTasks";
import {
  buildFirstTaskParams,
  type BuildFirstTaskParamsInput,
} from "@/lib/onboarding/buildFirstTaskParams";
import { DEFAULT_MODEL } from "@/lib/consts";

/**
 * Schedules the weekly report through `POST /api/tasks` (which also mints
 * the Trigger schedule). The one creator behind both entry points, the
 * onboarding confirm and the homepage starter card, so they produce the
 * same task (chat#1867, chat#2006).
 */
export async function createWeeklyReportTask(
  accessToken: string,
  input: BuildFirstTaskParamsInput,
): Promise<Task> {
  return createTask(accessToken, {
    ...buildFirstTaskParams(input),
    model: DEFAULT_MODEL,
  });
}
