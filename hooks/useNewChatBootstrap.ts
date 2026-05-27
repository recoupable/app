"use client";

import { useEffect, useRef, useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useOrganization } from "@/providers/OrganizationProvider";
import { createSession } from "@/lib/sessions/createSession";
import { createSandbox } from "@/lib/sandboxes/createSandbox";

/**
 * Discriminated state for a new chat bootstrap. The `ready` variant
 * carries the api-minted `sessionId` + `chatId` so the consumer can
 * mount `<Chat>` against the rows recoup-api actually persisted.
 */
export type NewChatBootstrapState =
  | { status: "idle" | "bootstrapping" }
  | { status: "ready"; sessionId: string; chatId: string }
  | { status: "error"; message: string };

/**
 * Runs the new-chat provisioning flow: read `selectedOrgId` from
 * `OrganizationProvider`, `POST /api/sessions` (api derives `cloneUrl`
 * server-side via `ensurePersonalRepo`), then `POST /api/sandbox` with
 * the api-returned `cloneUrl`.
 *
 * Caller renders the resulting state — this hook owns the effect, the
 * StrictMode double-mount guard, and the error → retryable transition.
 *
 * Why the StrictMode guard: `createSession` and `createSandbox` both
 * mint fresh rows on each POST (no idempotency key), so running twice
 * leaves orphans.
 */
export function useNewChatBootstrap(): NewChatBootstrapState {
  const { authenticated, getAccessToken } = usePrivy();
  const { selectedOrgId } = useOrganization();
  const [state, setState] = useState<NewChatBootstrapState>({ status: "idle" });
  const startedRef = useRef(false);

  useEffect(() => {
    if (!authenticated) return;
    if (startedRef.current) return;
    if (state.status !== "idle") return;

    startedRef.current = true;
    setState({ status: "bootstrapping" });

    void (async () => {
      try {
        const accessToken = await getAccessToken();
        if (!accessToken) {
          throw new Error("Please sign in to start a chat");
        }

        const { session, chat } = await createSession(
          { organizationId: selectedOrgId ?? undefined },
          accessToken,
        );
        await createSandbox(session.cloneUrl, session.id, accessToken);

        setState({ status: "ready", sessionId: session.id, chatId: chat.id });
      } catch (error) {
        startedRef.current = false;
        const message =
          error instanceof Error
            ? error.message
            : "Failed to start a new chat. Please try again.";
        setState({ status: "error", message });
      }
    })();
  }, [authenticated, selectedOrgId, getAccessToken, state.status]);

  return state;
}
