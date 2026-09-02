import { getClientApiBaseUrl } from "@/lib/api/getClientApiBaseUrl";
import type { ProjectComment } from "@/lib/projects/types";

/** Longest comment the API accepts, per the documented contract. */
export const COMMENT_MAX_LENGTH = 4000;

/**
 * Post a comment on a task, attributed to the signed-in account.
 * @see https://docs.recoupable.dev/api-reference/projects/comments-create
 */
export async function createProjectComment(
  accessToken: string,
  projectId: string,
  taskId: string,
  body: string,
): Promise<ProjectComment> {
  const response = await fetch(
    `${getClientApiBaseUrl()}/api/projects/${projectId}/tasks/${taskId}/comments`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ body }),
    },
  );

  if (!response.ok) {
    throw new Error(`Failed to post comment: ${response.status}`);
  }

  const { comment } = (await response.json()) as { comment: ProjectComment };
  return comment;
}
