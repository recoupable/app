"use client";

import { createContext, useContext, type ReactNode } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useOrganization } from "@/providers/OrganizationProvider";
import { useArtistProvider } from "@/providers/ArtistProvider";
import {
  useProvisionChatSession,
  type ProvisionChatSessionState,
} from "@/hooks/sessions/useProvisionChatSession";

const ChatSessionProvisionContext =
  createContext<ProvisionChatSessionState | null>(null);

/**
 * Starts session + sandbox provisioning as soon as auth, org, and artist
 * roster are ready — before the user opens `/` or `/chat`. `NewChatBootstrap`
 * reads the same state and mounts `<Chat>` only when `status === "ready"`,
 * keeping `sessionId` required (#1765) while shortening the spinner wait
 * (recoupable/chat#1767, option B).
 */
export function ChatSessionProvisionProvider({
  children,
}: {
  children: ReactNode;
}) {
  const { authenticated } = usePrivy();
  const { selectedOrgId } = useOrganization();
  const { selectedArtist, isLoading: isArtistsLoading } = useArtistProvider();

  const state = useProvisionChatSession({
    enabled: authenticated && !isArtistsLoading,
    artistId: selectedArtist?.account_id,
    orgId: selectedOrgId ?? undefined,
  });

  return (
    <ChatSessionProvisionContext.Provider value={state}>
      {children}
    </ChatSessionProvisionContext.Provider>
  );
}

export function useChatSessionProvision(): ProvisionChatSessionState {
  const state = useContext(ChatSessionProvisionContext);
  if (state === null) {
    throw new Error(
      "useChatSessionProvision must be used within ChatSessionProvisionProvider",
    );
  }
  return state;
}
