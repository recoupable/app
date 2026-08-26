"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { usePrivy } from "@privy-io/react-auth";
import { toast } from "sonner";
import {
  createMusicGeneration,
  CreateMusicGenerationBody,
} from "@/lib/music/createMusicGeneration";
import { useUserProvider } from "@/providers/UserProvder";
import { useOrganization } from "@/providers/OrganizationProvider";

export function useCreateMusicGeneration() {
  const { getAccessToken } = usePrivy();
  const { userData } = useUserProvider();
  const { selectedOrgId } = useOrganization();
  const queryClient = useQueryClient();

  const { mutate: generate, isPending } = useMutation({
    mutationFn: async (body: CreateMusicGenerationBody) => {
      const accessToken = await getAccessToken();
      if (!accessToken) throw new Error("AUTH_REQUIRED");

      return createMusicGeneration(accessToken, {
        ...body,
        // Organizations are accounts, so an org-scoped generation is one whose
        // account_id is the organization. The API ignores organization_id
        // outright, so sending that instead would silently produce a personal
        // song while the user believed they were in an org.
        ...(selectedOrgId ? { account_id: selectedOrgId } : {}),
      });
    },
    onSuccess: async () => {
      // Refetch immediately so the pending generation appears in the gallery
      // and starts the poll, rather than waiting for the next interval.
      await queryClient.invalidateQueries({
        queryKey: ["music-generations", userData?.account_id || ""],
      });
    },
    onError: (error: Error) => {
      if (error.message === "insufficient_credits") {
        toast.error("Not enough credits to generate this song.");
        return;
      }
      toast.error(error.message || "Could not start the generation.");
    },
  });

  return { generate, isPending };
}
