"use client";

import { useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { toast } from "sonner";
import { addSpotifyArtist } from "@/lib/artists/addSpotifyArtist";
import { useArtistProvider } from "@/providers/ArtistProvider";
import { useOrganization } from "@/providers/OrganizationProvider";
import type { SpotifyArtistSearchResult } from "@/types/spotify";

/**
 * Adds a Spotify-searched artist to the roster and refreshes + selects it.
 * Wraps `addSpotifyArtist` with auth + the shared roster (ArtistProvider),
 * mirroring `useAddRosterArtist`.
 */
export function useAddSpotifyArtist() {
  const { getAccessToken } = usePrivy();
  const { getArtists } = useArtistProvider();
  const { selectedOrgId } = useOrganization();
  const [isAdding, setIsAdding] = useState(false);

  const add = async (artist: SpotifyArtistSearchResult): Promise<boolean> => {
    setIsAdding(true);
    try {
      const accessToken = await getAccessToken();
      if (!accessToken) {
        throw new Error("Please sign in to add an artist");
      }
      const created = await addSpotifyArtist(
        accessToken,
        artist,
        selectedOrgId,
      );
      await getArtists(created.account_id);
      toast.success(`${artist.name} added to your roster`);
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

  return { add, isAdding };
}
