"use client";

import { useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { toast } from "sonner";
import { deleteArtistSocial } from "@/lib/artists/deleteArtistSocial";
import { useArtistProvider } from "@/providers/ArtistProvider";
import type { ArtistRecord } from "@/types/Artist";

/**
 * Removes a social from an artist during verify-socials, then refreshes the
 * roster so the row disappears.
 *
 * `useSocialFix` could only add or replace (chat#1889): a user who added the
 * wrong profile had no way to take it back, and was left staring at a list they
 * could not correct. Removal is the missing half of the same step.
 */
export function useSocialRemove() {
  const { getAccessToken } = usePrivy();
  const { getArtists } = useArtistProvider();
  const [removingSocialId, setRemovingSocialId] = useState<string | null>(null);

  const removeSocial = async (
    artist: ArtistRecord,
    socialId: string,
  ): Promise<boolean> => {
    setRemovingSocialId(socialId);
    try {
      const accessToken = await getAccessToken();
      if (!accessToken) {
        throw new Error("Please sign in to remove a social");
      }
      await deleteArtistSocial(accessToken, artist.account_id, socialId);
      await getArtists();
      return true;
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to remove social",
      );
      return false;
    } finally {
      setRemovingSocialId(null);
    }
  };

  return { removeSocial, removingSocialId };
}
