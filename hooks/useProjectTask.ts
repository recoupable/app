import { useQuery } from "@tanstack/react-query";
import { usePrivy } from "@privy-io/react-auth";
import { getProjectTask } from "@/lib/projects/getProjectTask";
import type { ProjectTaskResponse } from "@/lib/projects/types";

/**
 * One project task with its comment feed (app#2048). Null on 404, as
 * `useProject`. Keyed under the project so a task mutation can invalidate the
 * project list alongside it.
 */
export function useProjectTask(projectId: string, taskId: string) {
  const { getAccessToken, authenticated } = usePrivy();

  return useQuery<ProjectTaskResponse | null>({
    queryKey: ["project", projectId, "task", taskId],
    queryFn: async () => {
      const accessToken = await getAccessToken();
      if (!accessToken) throw new Error("Please sign in to view this task");
      return getProjectTask(accessToken, projectId, taskId);
    },
    enabled: !!projectId && !!taskId && authenticated,
  });
}
