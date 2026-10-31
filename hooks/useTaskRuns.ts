import { useQuery } from "@tanstack/react-query";
import { getTaskRuns } from "@/lib/tasks/getTaskRuns";
import { useTaskRunScope, type TaskRunScopeOptions } from "./useTaskRunScope";

export function useTaskRuns(options: TaskRunScopeOptions = {}) {
  const scope = useTaskRunScope(options);
  const query = useQuery({
    queryKey: ["task-runs", scope.scopeKey],
    queryFn: ({ signal }) =>
      scope.read(signal, (token) =>
        getTaskRuns(token, {
          accountIdOverride: scope.accountId,
          apiBaseUrl: scope.apiBaseUrl,
          signal,
        }),
      ),
    enabled: scope.ready,
    gcTime: 0,
  });
  return {
    ...query,
    data: scope.ready && !query.error ? query.data : undefined,
    scopeReady: scope.ready,
    accountId: scope.accountId,
  };
}
