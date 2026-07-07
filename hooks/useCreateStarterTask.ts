"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { usePrivy } from "@privy-io/react-auth";
import { toast } from "sonner";
import { createStarterTask } from "@/lib/home/createStarterTask";
import { findStarterTemplate } from "@/lib/home/findStarterTemplate";
import fetchAgentTemplates from "@/lib/agent-templates/fetchAgentTemplates";
import type { AgentTemplateRow } from "@/types/AgentTemplates";
import { useArtistProvider } from "@/providers/ArtistProvider";
import { useUserProvider } from "@/providers/UserProvder";

/**
 * One-click creation of the homepage starter task. The task is sourced
 * from an existing /agents template (DRY — findStarterTemplate picks it
 * from the shared agent-templates query); auth + artist come from
 * providers and the mutation goes through the existing `POST /api/tasks`
 * path which also mints the schedule (recoupable/chat#1850).
 */
export function useCreateStarterTask() {
  const { getAccessToken } = usePrivy();
  const { selectedArtist } = useArtistProvider();
  const { userData } = useUserProvider();
  const queryClient = useQueryClient();

  const { data: templates } = useQuery<AgentTemplateRow[]>({
    queryKey: ["agent-templates"],
    queryFn: () => fetchAgentTemplates(userData!),
    retry: 1,
    enabled: !!userData?.id,
  });
  const starterTemplate = findStarterTemplate(templates);

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
      if (!starterTemplate) {
        throw new Error("TEMPLATE_REQUIRED");
      }
      const accessToken = await getAccessToken();
      if (!accessToken) {
        throw new Error("AUTH_REQUIRED");
      }
      return createStarterTask(accessToken, {
        template: starterTemplate,
        artistName,
        artistAccountId,
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

  return { handleCreateStarterTask, isCreating, isScheduled, starterTemplate };
}
