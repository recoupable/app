import { createTask } from "@/lib/tasks/createTask";
import type { Task } from "@/lib/tasks/getTasks";
import type { AgentTemplateRow } from "@/types/AgentTemplates";
import { buildStarterTaskParams } from "@/lib/home/buildStarterTaskParams";
import { DEFAULT_MODEL } from "@/lib/consts";

interface CreateStarterTaskInput {
  template: AgentTemplateRow;
  artistName: string;
  artistAccountId: string;
}

/**
 * Creates the homepage starter task through the existing task-creation
 * path (`POST /api/tasks`, which also mints the schedule). The task is
 * built from an existing /agents template (DRY).
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
