"use client";

import { useChatSessionProvision } from "@/providers/ChatSessionProvisionProvider";
import type { ProvisionChatSessionState } from "./sessions/useProvisionChatSession";

/**
 * Re-exported here so legacy imports of `NewChatBootstrapState` from
 * `useNewChatBootstrap` keep working.
 */
export type NewChatBootstrapState = ProvisionChatSessionState;

/**
 * Reads app-level chat session provision state. Provisioning starts in
 * `ChatSessionProvisionProvider` right after login; this hook does not
 * trigger POSTs itself.
 */
export function useNewChatBootstrap(): NewChatBootstrapState {
  return useChatSessionProvision().state;
}
