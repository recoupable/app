import { useQuery } from "@tanstack/react-query";
import { usePrivy } from "@privy-io/react-auth";
import { getProject } from "@/lib/projects/getProject";
import type { ProjectResponse } from "@/lib/projects/types";

/**
 * One client project with its tasks (app#2048). Resolves to null when the API
 * answers 404 — an unknown id, or one the signed-in account cannot reach.
 */
export function useProject(projectId: string) {
  const { getAccessToken, authenticated } = usePrivy();

  return useQuery<ProjectResponse | null>({
    queryKey: ["project", projectId],
    queryFn: async () => {
      const accessToken = await getAccessToken();
      if (!accessToken) throw new Error("Please sign in to view this project");
      return getProject(accessToken, projectId);
    },
    enabled: !!projectId && authenticated,
  });
}
