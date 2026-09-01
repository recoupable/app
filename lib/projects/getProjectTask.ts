import { getClientApiBaseUrl } from "@/lib/api/getClientApiBaseUrl";
import type { ProjectTaskResponse } from "@/lib/projects/types";

/**
 * One task with its comment feed and the project's collaborators.
 * @see https://docs.recoupable.dev/api-reference/projects/task-get
 *
 * Null on 404, for the same reason as `getProject`.
 */
export async function getProjectTask(
  accessToken: string,
  projectId: string,
  taskId: string,
): Promise<ProjectTaskResponse | null> {
  const response = await fetch(
    `${getClientApiBaseUrl()}/api/projects/${projectId}/tasks/${taskId}`,
    { headers: { Authorization: `Bearer ${accessToken}` } },
  );

  if (response.status === 404) return null;
  if (!response.ok) {
    throw new Error(`Failed to load task: ${response.status}`);
  }

  return (await response.json()) as ProjectTaskResponse;
}
