"use client";

import { useEffect, useRef, useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { getChat } from "@/lib/chats/getChat";

/**
 * Discriminated state for resolving an existing chat. The `ready`
 * variant carries the `sessionId` the workflow transport + history read
 * require; `not_found` covers chats that don't exist or aren't
 * accessible (deleted-account / unmigrated rooms).
 */
export type ExistingChatBootstrapState =
  | { status: "loading" }
  | { status: "ready"; sessionId: string; chatId: string }
  | { status: "not_found" }
  | { status: "error"; message: string };

/**
 * Resolves an existing `/chat/[roomId]` chat to its `sessionId` via
 * recoup-api `GET /api/chats/{chatId}`, so the page can mount `<Chat>`
 * on the workflow path (recoupable/chat#1747). Backfilled rooms carry a
 * `session_id` (`chats.id == rooms.id`); a chat with no session, or one
 * the caller can't access, resolves to `not_found`.
 *
 * Mount with `key={roomId}` so a route change to a different chat
 * remounts and re-resolves; the ref then only guards StrictMode's
 * double-invoke. The GET is side-effect-free, so a duplicate fetch is
 * harmless either way.
 */
export function useExistingChatBootstrap(chatId: string): ExistingChatBootstrapState {
  const { authenticated, getAccessToken } = usePrivy();
  const [state, setState] = useState<ExistingChatBootstrapState>({ status: "loading" });
  const startedRef = useRef(false);

  useEffect(() => {
    if (!authenticated) return;
    if (startedRef.current) return;
    startedRef.current = true;

    void (async () => {
      try {
        const accessToken = await getAccessToken();
        const chat = await getChat(chatId, accessToken);
        if (!chat || !chat.sessionId) {
          setState({ status: "not_found" });
          return;
        }
        setState({ status: "ready", sessionId: chat.sessionId, chatId: chat.id });
      } catch (error) {
        startedRef.current = false;
        const message = error instanceof Error ? error.message : "Failed to load chat.";
        setState({ status: "error", message });
      }
    })();
  }, [authenticated, chatId, getAccessToken]);

  return state;
}
