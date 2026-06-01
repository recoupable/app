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
 * `useProvisionChatSession`. Waits for org localStorage hydration
 * (`isOrgReady`) and artist roster load before enabling provision so
 * artist/org switches mint one session, not several.
 */
export function useNewChatBootstrap(): NewChatBootstrapState {
  const { authenticated } = usePrivy();
  const { selectedOrgId, isOrgReady } = useOrganization();
  const { selectedArtist, isLoading: isArtistsLoading } = useArtistProvider();

  return useProvisionChatSession({
    enabled: authenticated && isOrgReady && !isArtistsLoading,
    artistId: selectedArtist?.account_id,
    orgId: selectedOrgId ?? undefined,
  });
}
