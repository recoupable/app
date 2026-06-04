"use client";

import { useEffect, useRef } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { updateChat } from "@/lib/chats/updateChat";

interface UsePersistChatModelIdInput {
  sessionId: string | undefined;
  /** Api-minted chat row id (not the client placeholder on new-chat bootstrap). */
  chatId: string;
  model: string;
}

/**
 * Keeps `chats.model_id` in sync with the UI model picker. The workflow
 * bills from the DB column (`handleChatWorkflowStream`), not the send
 * body, so this PATCH runs when ids are ready and whenever the user
 * changes model.
 */
export function usePersistChatModelId({
  sessionId,
  chatId,
  model,
}: UsePersistChatModelIdInput): void {
  const { getAccessToken } = usePrivy();
  const lastSyncedRef = useRef<{ scope: string; model: string } | null>(null);

  useEffect(() => {
    if (!sessionId) {
      return;
    }

    const scope = `${sessionId}:${chatId}`;
    if (
      lastSyncedRef.current?.scope === scope &&
      lastSyncedRef.current?.model === model
    ) {
      return;
    }

    let cancelled = false;

    void (async () => {
      const accessToken = await getAccessToken();
      if (!accessToken || cancelled) {
        return;
      }

      try {
        await updateChat({
          accessToken,
          sessionId,
          chatId,
          modelId: model,
        });
        if (!cancelled) {
          lastSyncedRef.current = { scope, model };
        }
      } catch (error) {
        console.error("[usePersistChatModelId] Failed to persist model:", error);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [sessionId, chatId, model, getAccessToken]);
}
