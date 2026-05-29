import { useState, useEffect } from "react";
import { UIMessage } from "ai";
import { usePrivy } from "@privy-io/react-auth";
import { getChatMessages } from "@/lib/messages/getChatMessages";

/**
 * Loads the persisted UI message stream for a session-scoped chat from
 * recoup-api. Skips entirely when either id is missing — the new-chat
 * bootstrap path mounts `<Chat>` before a session has been minted, and
 * the in-transition legacy `/chat/{roomId}` route lacks a sessionId
 * until track I redirects it.
 */
export function useMessageLoader(
  sessionId: string | undefined,
  chatId: string | undefined,
  userId: string | undefined,
  setMessages: (messages: UIMessage[]) => void,
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

        const initialMessages = await getChatMessages(
          sessionId,
          chatId,
          accessToken,
        );
        if (initialMessages.length > 0) {
          setMessages(initialMessages);
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
  }, [userId, sessionId, chatId, getAccessToken, setMessages]);

  return {
    isLoading,
    error,
    hasError: !!error,
  };
}
