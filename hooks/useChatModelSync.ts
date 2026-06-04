"use client";

import { useEffect, useRef, useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { getSessionChat } from "@/lib/chats/getSessionChat";
import { updateChat } from "@/lib/chats/updateChat";

interface UseChatModelSyncInput {
  sessionId: string | undefined;
  /** Api-minted chat row id (not the client placeholder on new-chat bootstrap). */
  chatId: string;
  model: string;
  setModel: (model: string) => void;
  /**
   * When true, load `chats.model_id` from the API before persisting the
   * global picker value — avoids overwriting existing chats on mount.
   */
  hydrateFromDatabase: boolean;
}

/**
 * Keeps the UI model picker and `chats.model_id` aligned. The workflow
 * bills from the DB column, not the send body.
 */
export function useChatModelSync({
  sessionId,
  chatId,
  model,
  setModel,
  hydrateFromDatabase,
}: UseChatModelSyncInput): void {
  const { getAccessToken } = usePrivy();
  const [hydrated, setHydrated] = useState(!hydrateFromDatabase);
  const lastSyncedRef = useRef<{ scope: string; model: string } | null>(null);
  const persistChainRef = useRef(Promise.resolve());

  useEffect(() => {
    persistChainRef.current = Promise.resolve();
    lastSyncedRef.current = null;
    setHydrated(!hydrateFromDatabase);
  }, [sessionId, chatId, hydrateFromDatabase]);

  useEffect(() => {
    if (!hydrateFromDatabase || !sessionId) {
      return;
    }

    const scope = `${sessionId}:${chatId}`;
    let cancelled = false;

    void (async () => {
      const accessToken = await getAccessToken();
      if (!accessToken || cancelled) {
        return;
      }

      try {
        const { chat } = await getSessionChat(sessionId, chatId, accessToken);
        if (cancelled) {
          return;
        }
        if (chat.modelId) {
          lastSyncedRef.current = { scope, model: chat.modelId };
          setModel(chat.modelId);
        }
      } catch (error) {
        console.error("[useChatModelSync] Failed to hydrate model:", error);
      } finally {
        if (!cancelled) {
          setHydrated(true);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [hydrateFromDatabase, sessionId, chatId, getAccessToken, setModel]);

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
        lastSyncedRef.current = { scope, model: modelToWrite };
      })
      .catch((error) => {
        console.error("[useChatModelSync] Failed to persist model:", error);
      });
  }, [sessionId, chatId, model, hydrated, getAccessToken]);
}
