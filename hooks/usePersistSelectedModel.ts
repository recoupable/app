"use client";

import { useCallback, useRef } from "react";
import { updateChat } from "@/lib/chats/updateChat";
import {
  shouldPersistChatModel,
  type PersistedChatModel,
} from "@/lib/chats/shouldPersistChatModel";

interface UsePersistSelectedModelInput {
  sessionId: string | undefined;
  chatId: string;
  model: string;
  getAccessToken: () => Promise<string | null>;
}

/**
 * Returns a function that persists the picker's selected model to
 * `chats.model_id` before a send.
 *
 * The chat-workflow path bills the model it reads from `chats.model_id` at
 * request time, so the write must land first — the returned function is
 * meant to be `await`ed before `sendMessage` so a new chat's very first turn
 * bills the selected model, not the default. Redundant writes are skipped
 * via `shouldPersistChatModel`, and a failed PATCH never blocks the send.
 */
export function usePersistSelectedModel({
  sessionId,
  chatId,
  model,
  getAccessToken,
}: UsePersistSelectedModelInput): () => Promise<void> {
  // The {chatId, model} we last wrote, so we only PATCH when the selection
  // actually changes for the active chat.
  const lastPersistedModelRef = useRef<PersistedChatModel>(null);

  return useCallback(async () => {
    if (!sessionId || !chatId) return;
    if (!shouldPersistChatModel(lastPersistedModelRef.current, chatId, model)) {
      return;
    }

    try {
      const accessToken = await getAccessToken();
      if (!accessToken) return;
      await updateChat({ accessToken, sessionId, chatId, modelId: model });
      lastPersistedModelRef.current = { chatId, model };
    } catch (error) {
      console.error("Failed to persist selected model before send:", error);
    }
  }, [sessionId, chatId, model, getAccessToken]);
}
