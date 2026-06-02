import { useState, useEffect } from "react";
import { UIMessage } from "ai";
import { usePrivy } from "@privy-io/react-auth";
import { getChatSnapshot } from "@/lib/messages/getChatSnapshot";

/**
 * Loads the persisted UI message stream for a session-scoped chat from
 * recoup-api. Skips entirely when either id is missing — the new-chat
 * bootstrap path mounts `<Chat>` before a session has been minted, and
 * the in-transition legacy `/chat/{roomId}` route lacks a sessionId
 * until track I redirects it.
 *
 * When the loaded chat still has a workflow run in flight, `onActiveStream`
 * fires once so the caller can reconnect to the live stream.
 */
export function useMessageLoader(
  sessionId: string | undefined,
  chatId: string | undefined,
  userId: string | undefined,
  setMessages: (messages: UIMessage[]) => void,
  onActiveStream?: () => void,
) {
  const { getAccessToken } = usePrivy();
  const [isLoading, setIsLoading] = useState(!!(sessionId && chatId));
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!sessionId || !chatId) {
      setIsLoading(false);
      return;
    }

    if (!userId) {
      setIsLoading(true);
      return;
    }

    const loadMessages = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const accessToken = await getAccessToken();
        if (!accessToken) return;

        const { messages, isStreaming } = await getChatSnapshot(
          sessionId,
          chatId,
          accessToken,
        );
        if (messages.length > 0) {
          setMessages(messages);
        }
        if (isStreaming) {
          onActiveStream?.();
        }
      } catch (err) {
        console.error("Error loading messages:", err);
        setError(
          err instanceof Error ? err : new Error("Failed to load messages"),
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadMessages();
  }, [userId, sessionId, chatId, getAccessToken, setMessages, onActiveStream]);

  return {
    isLoading,
    error,
    hasError: !!error,
  };
}
