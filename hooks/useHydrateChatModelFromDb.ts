"use client";

import { useEffect, type MutableRefObject } from "react";
import { getSessionChat } from "@/lib/chats/getSessionChat";

export type ChatModelSyncState = { scope: string; model: string };

interface UseHydrateChatModelFromDbInput {
  sessionId: string | undefined;
  chatId: string;
  hydrateFromDatabase: boolean;
  setModel: (model: string) => void;
  setHydrated: (hydrated: boolean) => void;
  lastSyncedRef: MutableRefObject<ChatModelSyncState | null>;
  getAccessToken: () => Promise<string | null>;
}

/** Loads `chats.model_id` into the picker before any PATCH on existing chats. */
export function useHydrateChatModelFromDb({
  sessionId,
  chatId,
  hydrateFromDatabase,
  setModel,
  setHydrated,
  lastSyncedRef,
  getAccessToken,
}: UseHydrateChatModelFromDbInput): void {
  useEffect(() => {
    if (!hydrateFromDatabase || !sessionId) {
      return;
    }

    const scope = `${sessionId}:${chatId}`;
    let cancelled = false;

    void (async () => {
      try {
        const accessToken = await getAccessToken();
        if (!accessToken || cancelled) {
          return;
        }

        const { chat } = await getSessionChat(sessionId, chatId, accessToken);
        if (cancelled) {
          return;
        }
        if (chat.modelId) {
          lastSyncedRef.current = { scope, model: chat.modelId };
          setModel(chat.modelId);
        }

        if (!cancelled) {
          setHydrated(true);
        }
      } catch (error) {
        console.error("[useHydrateChatModelFromDb] Failed to hydrate model:", error);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [
    hydrateFromDatabase,
    sessionId,
    chatId,
    getAccessToken,
    setModel,
    setHydrated,
    lastSyncedRef,
  ]);
}
