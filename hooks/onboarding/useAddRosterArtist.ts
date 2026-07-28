"use client";

import { useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { toast } from "sonner";
import { createRosterArtist } from "@/lib/artists/createRosterArtist";
import saveArtist from "@/lib/saveArtist";
import { buildSocialFixPayload } from "@/lib/onboarding/buildSocialFixPayload";
import { useArtistProvider } from "@/providers/ArtistProvider";
import { useOrganization } from "@/providers/OrganizationProvider";

export interface AddRosterArtistOptions {
  /** Spotify profile URL from the typeahead, linked as the artist's social. */
  profileUrl?: string;
  /** Spotify avatar, so the roster row isn't a blank initial. */
  image?: string;
}

/**
 * "Add an artist" for the onboarding roster step. Creates the artist through
 * `POST /api/artists`, then — when the caller resolved a real Spotify artist —
 * attaches the profile URL and avatar via the existing
 * `PATCH /api/artists/{id}` path, and refreshes the shared roster.
 *
 * The second call is what makes the added artist usable: `POST /api/artists`
 * accepts only a name, and an artist with no Spotify id can never get a catalog
 * or a valuation (chat#1889). Enrichment failing is non-fatal — the artist is
 * already on the roster and its socials can still be fixed in the next step.
 */
export function useAddRosterArtist() {
  const { getAccessToken } = usePrivy();
  const { getArtists } = useArtistProvider();
  const { selectedOrgId } = useOrganization();
  const [isAdding, setIsAdding] = useState(false);

  const addArtist = async (
    name: string,
    options: AddRosterArtistOptions = {},
  ): Promise<boolean> => {
    const trimmed = name.trim();
    if (!trimmed) return false;
    setIsAdding(true);
    try {
      const accessToken = await getAccessToken();
      if (!accessToken) {
        throw new Error("Please sign in to add an artist");
      }
      const artist = await createRosterArtist(
        accessToken,
        trimmed,
        selectedOrgId,
      );

      const payload = options.profileUrl
        ? buildSocialFixPayload(options.profileUrl)
        : null;
      if (artist?.account_id && (payload || options.image)) {
        try {
          await saveArtist(accessToken, artist.account_id, {
            ...(payload ? { profileUrls: payload.profileUrls } : {}),
            ...(options.image ? { image: options.image } : {}),
          });
        } catch {
          // Swallowed on purpose. POST /api/artists already succeeded, so
          // surfacing this would leave the form open over an artist that
          // exists — and picking again would create a duplicate. The socials
          // are still fixable in the next step.
        }
      }

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
