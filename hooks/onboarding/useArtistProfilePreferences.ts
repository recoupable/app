"use client";

import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { usePrivy } from "@privy-io/react-auth";
import { toast } from "sonner";
import { z } from "zod";

const responseSchema = z.object({
  accountId: z.string().uuid(),
  artistIds: z.array(z.string().uuid()),
});

/** Server-backed, per-account choices; no browser-only completion flags. */
export function useArtistProfilePreferences() {
  const { authenticated, getAccessToken, user } = usePrivy();
  const sessionId = user?.id;
  const queryClient = useQueryClient();
  const queryKey = ["artist-profile-preferences", sessionId];
  const request = async (body?: { artistId: string; noProfile: boolean }) => {
    const token = await getAccessToken();
    if (!token) throw new Error("Please sign in to save your choice");
    const response = await fetch("/api/onboarding/artist-profiles", {
      method: body ? "PATCH" : "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        ...(body ? { "Content-Type": "application/json" } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
      cache: "no-store",
    });
    if (!response.ok)
      throw new Error(
        "Couldn’t save or load profile choices. Please try again.",
      );
    const parsed = responseSchema.safeParse(await response.json());
    if (!parsed.success)
      throw new Error("Couldn’t read saved profile choices. Please try again.");
    const result = parsed.data;
    return result.artistIds;
  };
  const query = useQuery({
    queryKey,
    queryFn: () => request(),
    enabled: authenticated && !!sessionId,
  });
  const mutation = useMutation({
    mutationFn: request,
    // Update only after the server confirms the write. Errors leave the artist unresolved.
    onSuccess: (artistIds) => queryClient.setQueryData(queryKey, artistIds),
    onError: (error) => toast.error(error.message),
  });
  return {
    ...query,
    artistIds: query.data ?? [],
    setNoProfile: (artistId: string, noProfile: boolean) =>
      mutation.mutateAsync({ artistId, noProfile }),
    isSaving: mutation.isPending,
  };
}
