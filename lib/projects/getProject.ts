import { getClientApiBaseUrl } from "@/lib/api/getClientApiBaseUrl";
import type { ProjectResponse } from "@/lib/projects/types";

/**
 * A project with its tasks and collaborators.
 * @see https://docs.recoupable.dev/api-reference/projects/get
 *
 * Returns null on 404, which the API uses both for an unknown id and for a
 * caller who is not a collaborator — the two are deliberately indistinguishable
 * so a response cannot be used to discover real project ids.
 */
export async function getProject(
  accessToken: string,
  projectId: string,
): Promise<ProjectResponse | null> {
  const response = await fetch(
    `${getClientApiBaseUrl()}/api/projects/${projectId}`,
    { headers: { Authorization: `Bearer ${accessToken}` } },
  );

  if (response.status === 404) return null;
  if (!response.ok) {
    throw new Error(`Failed to load project: ${response.status}`);
  }

  return (await response.json()) as ProjectResponse;
}
