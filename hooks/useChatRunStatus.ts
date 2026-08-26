import { useQuery } from "@tanstack/react-query";
import { usePrivy } from "@privy-io/react-auth";
import {
  getChatRunStatus,
  type ChatRunStatus,
} from "@/lib/tasks/getChatRunStatus";
import { getChatRunPollInterval } from "@/lib/tasks/getChatRunPollInterval";

/**
 * Polls a workflow run's status every 3s until it settles or the fetch
 * fails (chat#2006 item 4b). Disabled until a workflow run id is known.
 */
export function useChatRunStatus(workflowRunId: string | undefined) {
  const { getAccessToken, authenticated } = usePrivy();

  return useQuery<ChatRunStatus>({
    queryKey: ["chatRunStatus", workflowRunId],
    queryFn: async () => {
      const accessToken = await getAccessToken();
      return getChatRunStatus(workflowRunId!, accessToken!);
    },
    enabled: !!workflowRunId && authenticated,
    refetchInterval: (query) =>
      getChatRunPollInterval({
        status: query.state.data?.status,
        error: query.state.error,
      }),
    retry: 3,
    staleTime: 1000,
  });
}
