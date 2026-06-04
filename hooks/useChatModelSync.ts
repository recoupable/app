"use client";

import { useEffect, useRef, useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useHydrateChatModelFromDb } from "@/hooks/useHydrateChatModelFromDb";
import { usePersistChatModelToDb } from "@/hooks/usePersistChatModelToDb";

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
  const { authenticated, getAccessToken } = usePrivy();
  const [hydrated, setHydrated] = useState(!hydrateFromDatabase);
  const lastSyncedRef = useRef<{ scope: string; model: string } | null>(null);
  const persistChainRef = useRef(Promise.resolve());

  useEffect(() => {
    persistChainRef.current = Promise.resolve();
    lastSyncedRef.current = null;
    setHydrated(!hydrateFromDatabase);
  }, [sessionId, chatId, hydrateFromDatabase]);

  useHydrateChatModelFromDb({
    sessionId,
    chatId,
    model,
    hydrateFromDatabase,
    authenticated,
    setModel,
    setHydrated,
    lastSyncedRef,
    getAccessToken,
  });

  usePersistChatModelToDb({
    sessionId,
    chatId,
    model,
    hydrated,
    lastSyncedRef,
    persistChainRef,
    getAccessToken,
  });
}
