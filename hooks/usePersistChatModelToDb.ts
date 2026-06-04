"use client";

import { useEffect, type MutableRefObject } from "react";
import { updateChat } from "@/lib/chats/updateChat";
import type { ChatModelSyncState } from "@/hooks/useHydrateChatModelFromDb";

interface UsePersistChatModelToDbInput {
  sessionId: string | undefined;
  chatId: string;
  model: string;
  hydrated: boolean;
  lastSyncedRef: MutableRefObject<ChatModelSyncState | null>;
  persistChainRef: MutableRefObject<Promise<void>>;
  getAccessToken: () => Promise<string | null>;
}

/** Serializes PATCHes so the latest model selection wins in `chats.model_id`. */
export function usePersistChatModelToDb({
  sessionId,
  chatId,
  model,
  hydrated,
  lastSyncedRef,
  persistChainRef,
  getAccessToken,
}: UsePersistChatModelToDbInput): void {
  useEffect(() => {
    if (!sessionId || !hydrated) {
      return;
    }

    const scope = `${sessionId}:${chatId}`;
    if (
      lastSyncedRef.current?.scope === scope &&
      lastSyncedRef.current.model === model
    ) {
      return;
    }

    const modelToWrite = model;
    lastSyncedRef.current = { scope, model: modelToWrite };

    const clearPendingSync = () => {
      const synced = lastSyncedRef.current;
      if (synced?.scope === scope && synced.model === modelToWrite) {
        lastSyncedRef.current = null;
      }
    };

    persistChainRef.current = persistChainRef.current
      .then(async () => {
        const accessToken = await getAccessToken();
        if (!accessToken) {
          return;
        }
        await updateChat({
          accessToken,
          sessionId,
          chatId,
          modelId: modelToWrite,
        });
      })
      .catch((error) => {
        console.error("[usePersistChatModelToDb] Failed to persist model:", error);
        clearPendingSync();
      });
  }, [sessionId, chatId, model, hydrated, getAccessToken, lastSyncedRef, persistChainRef]);
}
