import { useQuery } from "@tanstack/react-query";
import { usePrivy } from "@privy-io/react-auth";
import { getTaskRuns, type TaskRunItem } from "@/lib/tasks/getTaskRuns";

interface UseTaskRunsParams {
  accountIdOverride?: string;
}

export function useTaskRuns({ accountIdOverride }: UseTaskRunsParams = {}) {
  const { getAccessToken, authenticated } = usePrivy();

  return useQuery<TaskRunItem[]>({
    queryKey: ["task-runs", { accountIdOverride }],
    queryFn: async () => {
      const accessToken = await getAccessToken();
      if (!accessToken) {
        throw new Error("Please sign in to view task runs");
      }
      return getTaskRuns(accessToken, { accountIdOverride });
    },
    enabled: authenticated,
  });
}
