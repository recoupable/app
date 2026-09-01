import { useMutation, useQueryClient } from "@tanstack/react-query";
import { usePrivy } from "@privy-io/react-auth";
import { setProjectTaskComplete } from "@/lib/projects/setProjectTaskComplete";

/**
 * Toggle a task's completion (app#2048). Invalidates the whole project key so
 * the task page and the list it came from agree without a reload.
 */
export function useSetProjectTaskComplete(projectId: string, taskId: string) {
  const { getAccessToken } = usePrivy();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (completed: boolean) => {
      const accessToken = await getAccessToken();
      if (!accessToken) throw new Error("Please sign in to update this task");
      return setProjectTaskComplete(accessToken, projectId, taskId, completed);
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["project", projectId] }),
  });
}
