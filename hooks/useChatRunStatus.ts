import { useQuery } from "@tanstack/react-query";
import { usePrivy } from "@privy-io/react-auth";
import {
  getChatRunStatus,
  type ChatRunStatus,
} from "@/lib/tasks/getChatRunStatus";

const TERMINAL = new Set(["completed", "failed", "cancelled"]);

/**
 * Polls a workflow run's status every 3s until it settles (chat#2006
 * item 4b). Disabled until a workflow run id is known.
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
      TERMINAL.has(query.state.data?.status ?? "") ? false : 3000,
    retry: 3,
    staleTime: 1000,
  });
}
