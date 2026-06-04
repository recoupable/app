"use client";

import { useEffect, type MutableRefObject } from "react";
import { getSessionChat } from "@/lib/chats/getSessionChat";

export type ChatModelSyncState = { scope: string; model: string };

interface UseHydrateChatModelFromDbInput {
  sessionId: string | undefined;
  chatId: string;
  /** Picker value when this chat scope opens; blocks auto-PATCH if hydrate fails. */
  model: string;
  hydrateFromDatabase: boolean;
  authenticated: boolean;
  setModel: (model: string) => void;
  setHydrated: (hydrated: boolean) => void;
  lastSyncedRef: MutableRefObject<ChatModelSyncState | null>;
  getAccessToken: () => Promise<string | null>;
}

/** Loads `chats.model_id` into the picker before any PATCH on existing chats. */
export function useHydrateChatModelFromDb({
  sessionId,
  chatId,
  model,
  hydrateFromDatabase,
  authenticated,
  setModel,
  setHydrated,
  lastSyncedRef,
  getAccessToken,
}: UseHydrateChatModelFromDbInput): void {
  useEffect(() => {
    if (!hydrateFromDatabase || !sessionId || !authenticated) {
      return;
    }

    const scope = `${sessionId}:${chatId}`;
    const pickerModelOnOpen = model;
    let cancelled = false;

    void (async () => {
      try {
        const accessToken = await getAccessToken();
        if (cancelled) {
          return;
        }
        if (!accessToken) {
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

        setHydrated(true);
      } catch (error) {
        console.error("[useHydrateChatModelFromDb] Failed to hydrate model:", error);
        if (!cancelled) {
          // Unblock user-initiated persist without auto-PATCHing this picker value.
          lastSyncedRef.current = { scope, model: pickerModelOnOpen };
          setHydrated(true);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [
    hydrateFromDatabase,
    authenticated,
    sessionId,
    chatId,
    getAccessToken,
    setModel,
    setHydrated,
    lastSyncedRef,
  ]);
}
