"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useOrganization } from "@/providers/OrganizationProvider";
import { useArtistProvider } from "@/providers/ArtistProvider";
import {
  useProvisionChatSession,
  type ProvisionChatSessionState,
} from "@/hooks/sessions/useProvisionChatSession";

interface ChatSessionProvisionContextValue {
  state: ProvisionChatSessionState;
  consumedChatId: string | null;
  resetProvision: () => void;
  markProvisionConsumed: (chatId: string) => void;
}

const ChatSessionProvisionContext =
  createContext<ChatSessionProvisionContextValue | null>(null);

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
  const [consumedChatId, setConsumedChatId] = useState<string | null>(null);

  const { state, reset: resetMutation } = useProvisionChatSession({
    enabled: authenticated && !isArtistsLoading,
    artistId: selectedArtist?.account_id,
    orgId: selectedOrgId ?? undefined,
  });

  const resetProvision = useCallback(() => {
    resetMutation();
    setConsumedChatId(null);
  }, [resetMutation]);

  const markProvisionConsumed = useCallback((chatId: string) => {
    setConsumedChatId(chatId);
  }, []);

  const value = useMemo(
    () => ({
      state,
      consumedChatId,
      resetProvision,
      markProvisionConsumed,
    }),
    [state, consumedChatId, resetProvision, markProvisionConsumed],
  );

  return (
    <ChatSessionProvisionContext.Provider value={value}>
      {children}
    </ChatSessionProvisionContext.Provider>
  );
}

export function useChatSessionProvision(): ChatSessionProvisionContextValue {
  const context = useContext(ChatSessionProvisionContext);
  if (context === null) {
    throw new Error(
      "useChatSessionProvision must be used within ChatSessionProvisionProvider",
    );
  }
  return context;
}
