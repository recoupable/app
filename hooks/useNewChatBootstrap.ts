"use client";

import { useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { usePrivy } from "@privy-io/react-auth";
import { useOrganization } from "@/providers/OrganizationProvider";
import { useArtistProvider } from "@/providers/ArtistProvider";
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

interface BootstrapInputs {
  artistId: string | undefined;
  orgId: string | undefined;
}

/**
 * Provisions a session + sandbox for a new chat, stamping
 * `sessions.artist_id` with the currently-selected artist. Re-fires on
 * artist or org change; the `sameInputs` guard makes incidental
 * re-renders idempotent.
 */
export function useNewChatBootstrap(): NewChatBootstrapState {
  const { authenticated, getAccessToken } = usePrivy();
  const { selectedOrgId } = useOrganization();
  const { selectedArtist, isLoading: isArtistsLoading } = useArtistProvider();

  const artistId = selectedArtist?.account_id;
  const orgId = selectedOrgId ?? undefined;

  const mutation = useMutation({
    mutationFn: async (input: BootstrapInputs) => {
      const accessToken = await getAccessToken();
      if (!accessToken) {
        throw new Error("Please sign in to start a chat");
      }
      const { session, chat } = await createSession(
        { artistId: input.artistId, organizationId: input.orgId },
        accessToken,
      );
      await createSandbox(session.cloneUrl, session.id, accessToken);
      return { sessionId: session.id, chatId: chat.id };
    },
  });

  useEffect(() => {
    if (!authenticated || isArtistsLoading) return;
    const last = mutation.variables;
    const sameInputs =
      last !== undefined && last.artistId === artistId && last.orgId === orgId;
    if (sameInputs && (mutation.isPending || mutation.isSuccess)) return;
    mutation.mutate({ artistId, orgId });
    // mutation.* read inside body, not as deps — they'd re-fire on every internal tick.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authenticated, isArtistsLoading, artistId, orgId]);

  if (
    !authenticated ||
    isArtistsLoading ||
    mutation.isIdle ||
    mutation.isPending
  ) {
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
