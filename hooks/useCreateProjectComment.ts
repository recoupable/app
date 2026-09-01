import { useMutation, useQueryClient } from "@tanstack/react-query";
import { usePrivy } from "@privy-io/react-auth";
import { createProjectComment } from "@/lib/projects/createProjectComment";

/**
 * Post a comment on a task (app#2048). Comments are append-only, so a
 * successful post only ever adds to the feed.
 */
export function useCreateProjectComment(projectId: string, taskId: string) {
  const { getAccessToken } = usePrivy();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (body: string) => {
      const accessToken = await getAccessToken();
      if (!accessToken) throw new Error("Please sign in to comment");
      return createProjectComment(accessToken, projectId, taskId, body);
    },
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ["project", projectId, "task", taskId],
      }),
  });
}
