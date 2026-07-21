"use client";

import { useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { toast } from "sonner";
import saveArtist from "@/lib/saveArtist";
import { buildSocialFixPayload } from "@/lib/onboarding/buildSocialFixPayload";
import { useArtistProvider } from "@/providers/ArtistProvider";
import type { ArtistRecord } from "@/types/Artist";

/**
 * Replaces a wrong auto-matched social (or adds a missing one) with a
 * corrected profile URL via the existing PATCH /api/artists/{id}
 * `profileUrls` path, then refreshes the roster. Matches are accepted by
 * default, so there is no verdict to record — the refreshed roster is the
 * source of truth for what's shown.
 */
export function useSocialFix() {
  const { getAccessToken } = usePrivy();
  const { getArtists } = useArtistProvider();
  const [fixingArtistId, setFixingArtistId] = useState<string | null>(null);

  const fixSocial = async (
    artist: ArtistRecord,
    url: string,
  ): Promise<boolean> => {
    const payload = buildSocialFixPayload(url);
    if (!payload) {
      toast.error(
        "Paste a profile link from Spotify, Instagram, TikTok, YouTube, X, Facebook, Threads, or Apple Music",
      );
      return false;
    }
    setFixingArtistId(artist.account_id);
    try {
      const accessToken = await getAccessToken();
      if (!accessToken) {
        throw new Error("Please sign in to update socials");
      }
      await saveArtist(accessToken, artist.account_id, {
        profileUrls: payload.profileUrls,
      });
      await getArtists();
      return true;
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update social",
      );
      return false;
    } finally {
      setFixingArtistId(null);
    }
  };

  return { fixSocial, fixingArtistId };
}
