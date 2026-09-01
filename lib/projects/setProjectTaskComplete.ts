import { getClientApiBaseUrl } from "@/lib/api/getClientApiBaseUrl";
import type { ProjectTask } from "@/lib/projects/types";

/**
 * Mark a task complete or reopen it.
 * @see https://docs.recoupable.dev/api-reference/projects/task-update
 *
 * Sends the `completed` boolean rather than a timestamp: the server stamps
 * `completed_at` and records `completed_by` from the caller, so who closed an
 * item is never ambiguous.
 */
export async function setProjectTaskComplete(
  accessToken: string,
  projectId: string,
  taskId: string,
  completed: boolean,
): Promise<ProjectTask> {
  const response = await fetch(
    `${getClientApiBaseUrl()}/api/projects/${projectId}/tasks/${taskId}`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ completed }),
    },
  );

  if (!response.ok) {
    throw new Error(`Failed to update task: ${response.status}`);
  }

  const { task } = (await response.json()) as { task: ProjectTask };
  return task;
}
