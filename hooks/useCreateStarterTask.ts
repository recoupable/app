"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { usePrivy } from "@privy-io/react-auth";
import { toast } from "sonner";
import { createStarterTask } from "@/lib/home/createStarterTask";
import { getBrowserTimezone } from "@/lib/home/getBrowserTimezone";
import { useArtistProvider } from "@/providers/ArtistProvider";

/**
 * One-click creation of the homepage starter task: the same weekly report
 * onboarding schedules, emailed to the account's address, through the
 * existing `POST /api/tasks` path which also mints the schedule
 * (recoupable/chat#1850, chat#2006). Auth + artist come from providers.
 */
export function useCreateStarterTask() {
  const { getAccessToken, user } = usePrivy();
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
      const recipientEmail = user?.email?.address;
      if (!recipientEmail) {
        throw new Error("EMAIL_REQUIRED");
      }
      const accessToken = await getAccessToken();
      if (!accessToken) {
        throw new Error("AUTH_REQUIRED");
      }
      return createStarterTask(accessToken, {
        artistName,
        artistAccountId,
        recipientEmail,
        timezone: getBrowserTimezone(),
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["scheduled-actions"],
        exact: false,
      });
      toast.success("Task scheduled for Mondays at 9am");
    },
    onError: (error) => {
      const code = error instanceof Error ? error.message : "";
      if (code === "ARTIST_REQUIRED") {
        toast.error("Please select an artist first.");
        return;
      }
      // Permanent for wallet/social-only logins: there is no address to
      // deliver to, so "try again" can't succeed (same as useConfirmFirstTask).
      if (code === "EMAIL_REQUIRED") {
        toast.error(
          "Add an email address to your account to receive your weekly report.",
        );
        return;
      }
      if (code === "AUTH_REQUIRED") {
        toast.error("Please sign in to create a task.");
        return;
      }
      toast.error("Failed to create the task. Please try again.");
    },
  });

  return { handleCreateStarterTask, isCreating, isScheduled };
}
