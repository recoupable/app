import { useCallback } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { stopChatWorkflow } from "@/lib/chat/stopChatWorkflow";

/**
 * Returns a fire-and-forget trigger for `POST /api/chat/{chatId}/stop`.
 *
 * Matches open-agents: the instant UI stop comes from the AI SDK's local
 * `stop()`, so we deliberately do not await the backend cancel. Correct
 * persisted state on reload is guaranteed server-side (api#590 persists the
 * assistant message per step and closes open tool-calls on abort).
 *
 * Workflow-chat-only: legacy `/api/chat` aborts locally and never hits this.
 */
export function useStopChatWorkflow(chatId: string) {
  const { getAccessToken } = usePrivy();

  return useCallback(() => {
    void (async () => {
      const token = await getAccessToken().catch(() => null);
      await stopChatWorkflow(chatId, token).catch(() => {});
    })();
  }, [chatId, getAccessToken]);
}
