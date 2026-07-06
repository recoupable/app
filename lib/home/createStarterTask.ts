import { createTask } from "@/lib/tasks/createTask";
import type { Task } from "@/lib/tasks/getTasks";
import { buildStarterTaskParams } from "@/lib/home/buildStarterTaskParams";
import { DEFAULT_MODEL } from "@/lib/consts";

interface CreateStarterTaskInput {
  artistName: string;
  artistAccountId: string;
}

/**
 * Creates the homepage starter task through the existing task-creation
 * path (`POST /api/tasks`, which also mints the schedule).
 */
export async function createStarterTask(
  accessToken: string,
  input: CreateStarterTaskInput,
): Promise<Task> {
  return createTask(accessToken, {
    ...buildStarterTaskParams(input),
    model: DEFAULT_MODEL,
  });
}
