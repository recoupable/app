"use client";

import { useCallback, useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { usePrivy } from "@privy-io/react-auth";
import {
  provisionChatSession,
  type ProvisionChatSessionInput,
} from "@/lib/sessions/provisionChatSession";

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

export interface UseProvisionChatSessionResult {
  state: ProvisionChatSessionState;
  /** Clears the mutation so the next enabled cycle mints a fresh session. */
  reset: () => void;
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
}: UseProvisionChatSessionInput): UseProvisionChatSessionResult {
  const { getAccessToken } = usePrivy();
  const [mintGeneration, setMintGeneration] = useState(0);

  const mutation = useMutation({
    mutationFn: async (input: ProvisionChatSessionInput) => {
      const accessToken = await getAccessToken();
      if (!accessToken) {
        throw new Error("Please sign in to start a chat");
      }
      return provisionChatSession(input, accessToken);
    },
  });

  const reset = useCallback(() => {
    mutation.reset();
    setMintGeneration((generation) => generation + 1);
  }, [mutation]);

  useEffect(() => {
    if (!enabled) return;
    const last = mutation.variables;
    const sameInputs =
      last !== undefined && last.artistId === artistId && last.orgId === orgId;
    if (sameInputs && (mutation.isPending || mutation.isSuccess)) return;
    mutation.mutate({ artistId, orgId });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mutation.* read for idempotency; inputs are [enabled, artistId, orgId, mintGeneration]
  }, [enabled, artistId, orgId, mintGeneration]);

  if (!enabled || mutation.isIdle || mutation.isPending) {
    return { state: { status: "bootstrapping" }, reset };
  }
  if (mutation.isError) {
    return {
      state: {
        status: "error",
        message:
          mutation.error instanceof Error
            ? mutation.error.message
            : "Failed to start a new chat. Please try again.",
      },
      reset,
    };
  }
  return {
    state: {
      status: "ready",
      sessionId: mutation.data.sessionId,
      chatId: mutation.data.chatId,
    },
    reset,
  };
}
