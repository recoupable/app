"use client";

import { useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { addSpotifyArtist } from "@/lib/artists/addSpotifyArtist";
import { runValuation } from "@/lib/valuation/runValuation";
import {
  MEASURING_TOAST_ERROR,
  MEASURING_TOAST_SUCCESS,
  measuringToastLoading,
} from "@/lib/catalog/measuringCopy";
import { useArtistProvider } from "@/providers/ArtistProvider";
import { useOrganization } from "@/providers/OrganizationProvider";
import useCatalogs from "@/hooks/useCatalogs";
import type { SpotifyArtistSearchResult } from "@/types/spotify";

/**
 * Adds a Spotify-searched artist to the roster and refreshes + selects it.
 * Wraps `addSpotifyArtist` with auth + the shared roster (ArtistProvider).
 * The onboarding roster step adds through this hook too, so a first artist
 * added during setup seeds the catalog the same way (chat#1889 row 8).
 *
 * On the **first** artist add (the account has no catalog yet) it also
 * fire-and-forget kicks `POST /api/valuation` for that artist's Spotify id —
 * seeding the onboarding catalog in the background so the "Claim your catalog"
 * step is already complete by the time the user reaches it (chat#1867).
 *
 * The selected organization owns both the artist and that seeded catalog. The
 * artist already followed the org; the catalog did not, so a catalog created
 * while working inside an org was owned by the user and stayed out of the org's
 * catalogs for every other member (chat#1943).
 */
export function useAddSpotifyArtist() {
  const { getAccessToken } = usePrivy();
  const { getArtists } = useArtistProvider();
  const { selectedOrgId } = useOrganization();
  const catalogsQuery = useCatalogs();
  const queryClient = useQueryClient();
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

      // Seed the onboarding catalog from the first artist's discography.
      // Only when we know there is no catalog yet (empty, not just unloaded),
      // and fire-and-forget so the dialog closes immediately — the catalog
      // materializes in ~20s and the sequence advances on the next landing.
      const catalogs = catalogsQuery.data?.catalogs;
      if (catalogs && catalogs.length === 0) {
        toast.promise(
          runValuation(accessToken, artist.id, selectedOrgId).then(() => {
            queryClient.invalidateQueries({ queryKey: ["catalogs"] });
          }),
          {
            loading: measuringToastLoading(artist.name),
            success: MEASURING_TOAST_SUCCESS,
            error: MEASURING_TOAST_ERROR,
          },
        );
      }
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
