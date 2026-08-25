import { createTask } from "@/lib/tasks/createTask";
import type { Task } from "@/lib/tasks/getTasks";
import {
  buildFirstTaskParams,
  type BuildFirstTaskParamsInput,
} from "@/lib/onboarding/buildFirstTaskParams";
import { DEFAULT_MODEL } from "@/lib/consts";

/**
 * Creates the homepage starter task through the existing task-creation
 * path (`POST /api/tasks`, which also mints the schedule). It schedules the
 * same weekly report onboarding does — `buildFirstTaskParams` — so both
 * entry points produce one prompt, in run voice, emailed to the account
 * (chat#2006).
 */
export async function createStarterTask(
  accessToken: string,
  input: BuildFirstTaskParamsInput,
): Promise<Task> {
  return createTask(accessToken, {
    ...buildFirstTaskParams(input),
    model: DEFAULT_MODEL,
  });
}
