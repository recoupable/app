import { useQuery } from "@tanstack/react-query";
import { usePrivy } from "@privy-io/react-auth";
import {
  getTaskRunStatus,
  type TaskRunStatus,
} from "@/lib/tasks/getTaskRunStatus";

const TERMINAL_STATUSES = new Set([
  "COMPLETED",
  "FAILED",
  "CRASHED",
  "CANCELED",
  "SYSTEM_FAILURE",
  "INTERRUPTED",
]);

const isTerminal = (data: TaskRunStatus | undefined): boolean =>
  TERMINAL_STATUSES.has(data?.status ?? "");

/**
 * Polls the task run status every 3s until the run reaches a terminal state.
 */
export function useTaskRunStatus(runId: string) {
  const { getAccessToken, authenticated } = usePrivy();

  return useQuery({
    queryKey: ["taskRunStatus", runId],
    queryFn: async () => {
      const accessToken = await getAccessToken();
      return getTaskRunStatus(runId, accessToken!);
    },
    enabled: !!runId && authenticated,
    refetchInterval: (query) => (isTerminal(query.state.data) ? false : 3000),
    retry: 3,
    staleTime: 1000,
  });
}
