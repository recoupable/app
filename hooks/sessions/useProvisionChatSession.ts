"use client";

import { useEffect, useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { usePrivy } from "@privy-io/react-auth";
import {
  provisionChatSession,
  type ProvisionChatSessionResult,
  type ProvisionChatSessionInput,
} from "@/lib/sessions/provisionChatSession";

/**
 * Discriminated lifecycle state for a chat-session provisioning attempt.
 * `ready` carries the api-minted `sessionId` + `chatId`; consumers mount
 * `<Chat>` against the rows recoup-api actually persisted.
 */
export type ProvisionChatSessionState =
  | { status: "idle" | "bootstrapping" }
  /** Session + chat exist and are routable; the sandbox is still coming (app#2052). */
  | { status: "session-ready"; sessionId: string; chatId: string }
  | { status: "ready"; sessionId: string; chatId: string }
  | { status: "error"; message: string };

interface UseProvisionChatSessionInput {
  /**
   * Caller-supplied gate (auth, dependent providers loading). Stays in
   * `bootstrapping` while false; the first true fires the provisioning POST.
   */
  enabled: boolean;
  artistId: string | undefined;
  orgId: string | undefined;
}

/**
 * Wraps `provisionChatSession` in a react-query mutation that re-fires
 * whenever `(artistId, orgId)` change, so each switch mints a fresh session.
 * Idempotency: react-query keeps the latest `mutate()` args on
 * `mutation.variables`; matching inputs bail, so re-renders don't re-fire.
 */
export function useProvisionChatSession({
  enabled,
  artistId,
  orgId,
}: UseProvisionChatSessionInput): ProvisionChatSessionState {
  const { getAccessToken } = usePrivy();

  const [earlyIds, setEarlyIds] = useState<ProvisionChatSessionResult | null>(
    null,
  );
  // Ids from an attempt superseded by an artist/org switch must not surface.
  const attemptRef = useRef(0);

  const mutation = useMutation({
    mutationFn: async (input: ProvisionChatSessionInput) => {
      const attempt = ++attemptRef.current;
      setEarlyIds(null);
      const accessToken = await getAccessToken();
      if (!accessToken) {
        throw new Error("Please sign in to start a chat");
      }
      return provisionChatSession(input, accessToken, (ids) => {
        if (attempt === attemptRef.current) setEarlyIds(ids);
      });
    },
  });

  useEffect(() => {
    if (!enabled) return;
    const last = mutation.variables;
    const sameInputs =
      last !== undefined && last.artistId === artistId && last.orgId === orgId;
    if (sameInputs && (mutation.isPending || mutation.isSuccess)) return;
    mutation.mutate({ artistId, orgId });
    // `mutation.*` are read inside the body, not declared as deps. The
    // dep array is the real input set; the effect bails idempotently
    // when those inputs already match the in-flight or completed call.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, artistId, orgId]);

  if (!enabled || mutation.isIdle || mutation.isPending) {
    return earlyIds
      ? { status: "session-ready", ...earlyIds }
      : { status: "bootstrapping" };
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
