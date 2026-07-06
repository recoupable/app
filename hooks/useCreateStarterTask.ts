"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { usePrivy } from "@privy-io/react-auth";
import { toast } from "sonner";
import { createStarterTask } from "@/lib/home/createStarterTask";
import { useArtistProvider } from "@/providers/ArtistProvider";

/**
 * One-click creation of the homepage starter task ("Weekly valuation +
 * streams report, Mondays"). Mirrors `useCreateTask`: auth + artist come
 * from providers, the mutation goes through the existing `POST /api/tasks`
 * path which also mints the schedule.
 */
export function useCreateStarterTask() {
  const { getAccessToken } = usePrivy();
  const { selectedArtist } = useArtistProvider();
  const queryClient = useQueryClient();

  const {
    mutate: handleCreateStarterTask,
    isPending: isCreating,
    isSuccess: isScheduled,
  } = useMutation({
    mutationFn: async () => {
      const artistAccountId = selectedArtist?.account_id;
      const artistName = selectedArtist?.name;
      if (!artistAccountId || !artistName) {
        throw new Error("ARTIST_REQUIRED");
      }
      const accessToken = await getAccessToken();
      if (!accessToken) {
        throw new Error("AUTH_REQUIRED");
      }
      return createStarterTask(accessToken, { artistName, artistAccountId });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["scheduled-actions"],
        exact: false,
      });
      toast.success("Task scheduled for Mondays at 9am");
    },
    onError: (error) => {
      if (error instanceof Error && error.message === "ARTIST_REQUIRED") {
        toast.error("Please select an artist first.");
        return;
      }
      if (error instanceof Error && error.message === "AUTH_REQUIRED") {
        toast.error("Please sign in to create a task.");
        return;
      }
      toast.error("Failed to create the task. Please try again.");
    },
  });

  return { handleCreateStarterTask, isCreating, isScheduled };
}
