import { useQuery } from "@tanstack/react-query";
import { useAccessToken } from "@/hooks/useAccessToken";
import { getTaskRunStatus, type TaskRunStatus } from "@/lib/tasks/getTaskRunStatus";

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
 *
 * @param runId
 */
export function useTaskRunStatus(runId: string) {
  const accessToken = useAccessToken();

  return useQuery({
    queryKey: ["taskRunStatus", runId],
    queryFn: () => getTaskRunStatus(runId, accessToken!),
    enabled: !!runId && !!accessToken,
    refetchInterval: query => (isTerminal(query.state.data) ? false : 3000),
    retry: 3,
    staleTime: 1000,
  });
}
