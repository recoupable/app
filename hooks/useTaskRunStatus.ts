import { useQuery } from "@tanstack/react-query";
import { useTaskRunScope, type TaskRunScopeOptions } from "./useTaskRunScope";
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
export function useTaskRunStatus(
  runId: string,
  options: TaskRunScopeOptions = {},
) {
  const scope = useTaskRunScope(options);
  const enabled = Boolean(runId) && scope.ready;

  const query = useQuery({
    queryKey: ["taskRunStatus", scope.scopeKey, runId],
    queryFn: ({ signal }) =>
      scope.read(signal, (token) =>
        getTaskRunStatus(runId, token, {
          accountIdOverride: scope.accountId,
          apiBaseUrl: scope.apiBaseUrl,
          signal,
        }),
      ),
    enabled,
    gcTime: 0,
    refetchInterval: (query) => (isTerminal(query.state.data) ? false : 3000),
    retry: 3,
    staleTime: 1000,
  });
  return {
    ...query,
    data: enabled && !query.error ? query.data : undefined,
    scopeReady: scope.ready,
    accountId: scope.accountId,
  };
}
