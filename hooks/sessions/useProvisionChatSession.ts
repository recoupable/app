"use client";

import { useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { usePrivy } from "@privy-io/react-auth";
import {
  provisionChatSession,
  type ProvisionChatSessionInput,
} from "@/lib/sessions/provisionChatSession";
import { shouldProvisionChatSession } from "@/hooks/sessions/shouldProvisionChatSession";

/**
 * Discriminated lifecycle state for a chat-session provisioning attempt.
 * `ready` carries the api-minted `sessionId` + `chatId`; consumers mount
 * `<Chat>` against the rows recoup-api actually persisted.
 */
export type ProvisionChatSessionState =
  | { status: "idle" | "bootstrapping" }
  | { status: "ready"; sessionId: string; chatId: string }
  | { status: "error"; message: string };

interface UseProvisionChatSessionInput {
  /**
   * Gate the mutation behind any caller-supplied condition (auth,
   * dependent providers still loading, etc.). Stays in
   * `bootstrapping` while false; first transition to true fires the
   * provisioning POST.
   */
  enabled: boolean;
  artistId: string | undefined;
  orgId: string | undefined;
}

/**
 * Wraps `provisionChatSession` in a react-query mutation that re-fires
 * whenever `(artistId, orgId)` change — so each artist/org switch mints
 * a fresh session against the new context.
 *
 * Idempotency: react-query keeps the most recent `mutate()` args on
 * `mutation.variables` through `isPending`/`isSuccess`. We compare
 * current inputs to those args and bail when they match — incidental
 * re-renders don't re-fire the mutation.
 */
export function useProvisionChatSession({
  enabled,
  artistId,
  orgId,
}: UseProvisionChatSessionInput): ProvisionChatSessionState {
  const { getAccessToken } = usePrivy();

  const mutation = useMutation({
    mutationFn: async (input: ProvisionChatSessionInput) => {
      const accessToken = await getAccessToken();
      if (!accessToken) {
        throw new Error("Please sign in to start a chat");
      }
      return provisionChatSession(input, accessToken);
    },
  });

  useEffect(() => {
    if (
      !shouldProvisionChatSession({
        enabled,
        artistId,
        orgId,
        lastVariables: mutation.variables,
        isPending: mutation.isPending,
        isSuccess: mutation.isSuccess,
      })
    ) {
      return;
    }
    mutation.mutate({ artistId, orgId });
    // `mutation.*` are read inside the body, not declared as deps. The
    // dep array is the real input set; `shouldProvisionChatSession` bails
    // idempotently when those inputs already match the in-flight or
    // completed call, or when a mismatched call is still pending.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, artistId, orgId]);

  if (!enabled || mutation.isIdle || mutation.isPending) {
    return { status: "bootstrapping" };
  }
  if (mutation.isError) {
    return {
      status: "error",
      message:
        mutation.error instanceof Error
          ? mutation.error.message
          : "Failed to start a new chat. Please try again.",
    };
  }
  return {
    status: "ready",
    sessionId: mutation.data.sessionId,
    chatId: mutation.data.chatId,
  };
}
