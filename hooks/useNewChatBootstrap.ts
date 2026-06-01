"use client";

import { usePrivy } from "@privy-io/react-auth";
import { useOrganization } from "@/providers/OrganizationProvider";
import { useArtistProvider } from "@/providers/ArtistProvider";
import {
  useProvisionChatSession,
  type ProvisionChatSessionState,
} from "./sessions/useProvisionChatSession";

/**
 * Re-exported here so legacy imports of `NewChatBootstrapState` from
 * `useNewChatBootstrap` keep working.
 */
export type NewChatBootstrapState = ProvisionChatSessionState;

/**
 * Wires Privy + Organization + Artist providers into
 * `useProvisionChatSession`. This hook contains no provisioning logic
 * — it just resolves the inputs (auth state, selected org, selected
 * artist) and delegates to the provisioner.
 */
export function useNewChatBootstrap(): NewChatBootstrapState {
  const { authenticated } = usePrivy();
  const { selectedOrgId } = useOrganization();
  const { selectedArtist, isLoading: isArtistsLoading } = useArtistProvider();

  return useProvisionChatSession({
    enabled: authenticated && !isArtistsLoading,
    artistId: selectedArtist?.account_id,
    orgId: selectedOrgId ?? undefined,
  });
}
