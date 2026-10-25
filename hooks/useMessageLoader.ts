import { useState, useEffect, useCallback } from "react";
import { UIMessage } from "ai";
import { usePrivy } from "@privy-io/react-auth";
import { getChatMessages } from "@/lib/messages/getChatMessages";

/**
 * Loads persisted UI messages for a session-scoped chat from recoup-api.
 */
export function useMessageLoader(
  sessionId: string | undefined,
  chatId: string | undefined,
  userId: string | undefined,
  setMessages: (messages: UIMessage[]) => void,
  /** Coordinated resume: called only after a successful current load, including empty history. */
  onLoaded?: () => void,
) {
  const { getAccessToken } = usePrivy();
  const [isLoading, setIsLoading] = useState(!!chatId);
  const [error, setError] = useState<Error | null>(null);

  const [attempt, setAttempt] = useState(0);
  const retry = useCallback(() => {
    setError(null);
    setIsLoading(true);
    setAttempt((previous) => previous + 1);
  }, []);

  useEffect(() => {
    let active = true;
    setError(null);
    if (!chatId || !sessionId) {
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
        if (!accessToken) throw new Error("Please sign in to load messages");

        const initialMessages = await getChatMessages(
          sessionId,
          chatId,
          accessToken,
        );
        if (!active) return;
        setMessages(initialMessages);
        onLoaded?.();
      } catch (err) {
        if (!active) return;
        setError(
          err instanceof Error ? err : new Error("Failed to load messages"),
        );
      } finally {
        if (active) setIsLoading(false);
      }
    };

    loadMessages();
    return () => {
      active = false;
    };
  }, [
    userId,
    sessionId,
    chatId,
    getAccessToken,
    setMessages,
    onLoaded,
    attempt,
  ]);

  return {
    isLoading,
    error,
    hasError: !!error,
    retry,
  };
}
