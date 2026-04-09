import type { QueryObserverResult } from "@tanstack/react-query";
import type { MutableRefObject } from "react";
import { useCallback, useEffect, useRef } from "react";
import type { Conversation } from "@/types/Chat";

type RefetchConversations = () => Promise<
  QueryObserverResult<Conversation[], Error>
>;

/**
 * Refetches recent chats (and credits on successful completion) for a new thread.
 * Eligible when there is no `[roomId]` param yet **or** `pendingNewThreadSidebarSyncRef`
 * is true (set after `replaceState` to `/chat/:id`, when Next may still expose `roomId`
 * in `useParams` and `!routeRoomId` would incorrectly disable sync).
 * Keeps sync scoped to the active chat id and only latches after a successful refetch.
 */
export function useNewChatSidebarSync({
  chatId,
  routeRoomId,
  pendingNewThreadSidebarSyncRef,
  refetchCredits,
  refetchConversations,
}: {
  chatId: string;
  /** Dynamic `[roomId]` param when present; undefined on `/chat` new-thread flow */
  routeRoomId: string | undefined;
  /** Set when the user starts a thread from `/chat` (or `?q=`); cleared after a successful sidebar refetch */
  pendingNewThreadSidebarSyncRef: MutableRefObject<boolean>;
  refetchCredits: () => Promise<unknown>;
  refetchConversations: RefetchConversations;
}) {
  const hasSyncedRecentChatsAfterFirstAssistantRef = useRef(false);
  const isRefreshingRecentChatsRef = useRef(false);
  const inFlightRefreshPromiseRef = useRef<Promise<boolean> | null>(null);
  const chatIdRef = useRef(chatId);
  chatIdRef.current = chatId;

  const isSidebarSyncEligible = useCallback(() => {
    return (
      pendingNewThreadSidebarSyncRef.current || routeRoomId === undefined
    );
  }, [pendingNewThreadSidebarSyncRef, routeRoomId]);

  useEffect(() => {
    hasSyncedRecentChatsAfterFirstAssistantRef.current = false;
    isRefreshingRecentChatsRef.current = false;
    inFlightRefreshPromiseRef.current = null;
  }, [chatId]);

  const refreshRecentChatsOnce = useCallback(async (): Promise<boolean> => {
    if (hasSyncedRecentChatsAfterFirstAssistantRef.current) return false;

    const existing = inFlightRefreshPromiseRef.current;
    if (existing) {
      return existing;
    }

    const startedForChatId = chatIdRef.current;

    const promiseRef: { current: Promise<boolean> | null } = { current: null };
    promiseRef.current = (async (): Promise<boolean> => {
      isRefreshingRecentChatsRef.current = true;
      try {
        const result = await refetchConversations();
        if (result.isSuccess && chatIdRef.current === startedForChatId) {
          hasSyncedRecentChatsAfterFirstAssistantRef.current = true;
          pendingNewThreadSidebarSyncRef.current = false;
          return true;
        }
        return false;
      } catch (error) {
        console.error("Failed to refresh recent chats:", error);
        return false;
      } finally {
        if (chatIdRef.current === startedForChatId) {
          isRefreshingRecentChatsRef.current = false;
        }
        const leader = promiseRef.current;
        if (leader && inFlightRefreshPromiseRef.current === leader) {
          inFlightRefreshPromiseRef.current = null;
        }
      }
    })();

    const p = promiseRef.current;
    inFlightRefreshPromiseRef.current = p;
    return p;
  }, [refetchConversations]);

  const onFinish = useCallback(
    async ({
      isError,
      isAbort,
    }: {
      isError: boolean;
      isAbort: boolean;
    }) => {
      const shouldRefreshCredits = !isError && !isAbort;
      const shouldRefreshRecentChats =
        isSidebarSyncEligible() &&
        shouldRefreshCredits &&
        !hasSyncedRecentChatsAfterFirstAssistantRef.current;

      await Promise.all([
        ...(shouldRefreshCredits ? [refetchCredits()] : []),
        ...(shouldRefreshRecentChats
          ? [
              (async () => {
                let ok = await refreshRecentChatsOnce();
                if (
                  !ok &&
                  !hasSyncedRecentChatsAfterFirstAssistantRef.current
                ) {
                  await refreshRecentChatsOnce();
                }
              })(),
            ]
          : []),
      ]);
    },
    [isSidebarSyncEligible, refetchCredits, refreshRecentChatsOnce],
  );

  const maybeRefreshOnFirstStream = useCallback(
    (chatStatus: string) => {
      if (!isSidebarSyncEligible()) return;
      if (chatStatus !== "streaming") return;
      if (hasSyncedRecentChatsAfterFirstAssistantRef.current) return;
      void refreshRecentChatsOnce();
    },
    [isSidebarSyncEligible, refreshRecentChatsOnce],
  );

  return { onFinish, maybeRefreshOnFirstStream };
}
