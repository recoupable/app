import { useMutation } from "@tanstack/react-query";
import { usePrivy } from "@privy-io/react-auth";
import { stopChatWorkflow } from "@/lib/chat/stopChatWorkflow";

/**
 * Wraps the `POST /api/chat/{chatId}/stop` round-trip with a React Query
 * mutation. Consumers read `isStopping` (`mutation.isPending`) to flip
 * the submit button to a "stopping" state the instant the user clicks,
 * so the UI doesn't sit dead for the 1–2s while the backend cancels the
 * workflow and the SSE watcher closes the stream.
 *
 * Workflow-chat-only: legacy `/api/chat` aborts locally via the AI SDK's
 * `stop()` and never hits this hook.
 */
export function useStopChatWorkflow(chatId: string) {
  const { getAccessToken } = usePrivy();

  const mutation = useMutation({
    mutationFn: async () => {
      const token = await getAccessToken().catch(() => null);
      await stopChatWorkflow(chatId, token);
    },
  });

  return {
    stop: mutation.mutateAsync,
    isStopping: mutation.isPending,
  };
}
