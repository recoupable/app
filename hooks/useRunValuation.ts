"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { usePrivy } from "@privy-io/react-auth";
import { useArtistProvider } from "@/providers/ArtistProvider";
import { useOrganization } from "@/providers/OrganizationProvider";
import { runValuation } from "@/lib/valuation/runValuation";
import { getArtistSpotifyId } from "@/lib/artist/getArtistSpotifyId";

/**
 * One-click valuation run for the roster (chat#1973). Resolves the artist to
 * value — the selected artist when it has a linked Spotify profile, otherwise
 * the first roster artist that does — and runs `POST /api/valuation` under the
 * signed-in account. `spotifyArtistId` is null when no roster artist can be
 * run against (the caller falls back to the /setup/artists route).
 *
 * The mutation error carries the API's error string verbatim (see
 * lib/valuation/runValuation) — surfaces render it, never a generic failure.
 * Auth and artist context come from providers per the chat hooks conventions.
 */
const useRunValuation = (spotifyArtistIdOverride?: string) => {
  const { getAccessToken, authenticated } = usePrivy();
  const { selectedArtist, sorted, isLoading: rosterPending } = useArtistProvider();
  const { selectedOrgId } = useOrganization();
  const queryClient = useQueryClient();

  const candidates = [selectedArtist, ...(sorted ?? [])].filter(
    (artist) => !!artist,
  );
  const runnable = candidates.find((artist) => !!artist && getArtistSpotifyId(artist));
  const spotifyArtistId =
    spotifyArtistIdOverride ?? (runnable ? getArtistSpotifyId(runnable) : null);

  const mutation = useMutation({
    mutationFn: async () => {
      if (!spotifyArtistId) throw new Error("No roster artist with a linked Spotify profile");
      const accessToken = await getAccessToken();
      if (!accessToken) throw new Error("Please sign in to run a valuation");
      // The selected organization owns the resulting catalog; without it an
      // organization-roster run would land on the personal account.
      return runValuation(accessToken, spotifyArtistId, selectedOrgId ?? undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["catalogs"] });
      queryClient.invalidateQueries({ queryKey: ["catalog-measurements"] });
      queryClient.invalidateQueries({ queryKey: ["runs"] });
    },
  });

  return {
    run: () => mutation.mutate(),
    isRunning: mutation.isPending,
    error: mutation.error,
    canRun: authenticated && !!spotifyArtistId,
    rosterPending,
    artistName: spotifyArtistIdOverride ? null : (runnable?.name ?? null),
  };
};

export default useRunValuation;
