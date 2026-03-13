import { useQuery } from "@tanstack/react-query";
import { usePrivy } from "@privy-io/react-auth";
import { getTaskRuns, type TaskRunItem } from "@/lib/tasks/getTaskRuns";

/**
 *
 */
export function useTaskRuns() {
  const { getAccessToken, authenticated } = usePrivy();

  return useQuery<TaskRunItem[]>({
    queryKey: ["task-runs"],
    queryFn: async () => {
      const accessToken = await getAccessToken();
      if (!accessToken) {
        throw new Error("Please sign in to view task runs");
      }
      return getTaskRuns(accessToken);
    },
    enabled: authenticated,
  });
}
