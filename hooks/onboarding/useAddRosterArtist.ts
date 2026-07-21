"use client";

import { useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { toast } from "sonner";
import { createRosterArtist } from "@/lib/artists/createRosterArtist";
import { useArtistProvider } from "@/providers/ArtistProvider";
import { useOrganization } from "@/providers/OrganizationProvider";

/**
 * "Add another artist" for the onboarding roster step. Creates the
 * artist through the existing `POST /api/artists` endpoint and refreshes
 * the shared roster (ArtistProvider) so the new artist appears in-flow.
 */
export function useAddRosterArtist() {
  const { getAccessToken } = usePrivy();
  const { getArtists } = useArtistProvider();
  const { selectedOrgId } = useOrganization();
  const [isAdding, setIsAdding] = useState(false);

  const addArtist = async (name: string): Promise<boolean> => {
    const trimmed = name.trim();
    if (!trimmed) return false;
    setIsAdding(true);
    try {
      const accessToken = await getAccessToken();
      if (!accessToken) {
        throw new Error("Please sign in to add an artist");
      }
      await createRosterArtist(accessToken, trimmed, selectedOrgId);
      await getArtists();
      return true;
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to add artist",
      );
      return false;
    } finally {
      setIsAdding(false);
    }
  };

  return { addArtist, isAdding };
}
