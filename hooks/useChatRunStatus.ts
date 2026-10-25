import { useQuery } from "@tanstack/react-query";
import { useTaskRunScope, type TaskRunScopeOptions } from "./useTaskRunScope";
import {
  getChatRunStatus,
  type ChatRunStatus,
} from "@/lib/tasks/getChatRunStatus";
import { getChatRunPollInterval } from "@/lib/tasks/getChatRunPollInterval";

/**
 * Polls a workflow run's status every 3s until it settles or the fetch
 * fails (chat#2006 item 4b). Disabled until a workflow run id is known.
 */
export function useChatRunStatus(
  workflowRunId: string | undefined,
  options: TaskRunScopeOptions = {},
) {
  const scope = useTaskRunScope(options);
  const enabled = Boolean(workflowRunId) && scope.ready;

  const query = useQuery<ChatRunStatus>({
    queryKey: ["chatRunStatus", scope.scopeKey, workflowRunId],
    queryFn: ({ signal }) =>
      scope.read(signal, (token) =>
        getChatRunStatus(workflowRunId!, token, {
          apiBaseUrl: scope.apiBaseUrl,
          signal,
        }),
      ),
    enabled,
    gcTime: 0,
    refetchInterval: (query) =>
      getChatRunPollInterval({
        status: query.state.data?.status,
        error: query.state.error,
      }),
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
