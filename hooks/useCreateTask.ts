"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { usePrivy } from "@privy-io/react-auth";
import { toast } from "sonner";
import { createTask } from "@/lib/tasks/createTask";
import { useArtistProvider } from "@/providers/ArtistProvider";
import { DEFAULT_MODEL } from "@/lib/consts";
import { getLocalTimezone } from "@/lib/timezone/getLocalTimezone";
import { getTaskHref } from "@/lib/tasks/getTaskHref";
import { PlanLimitError } from "@/lib/tasks/planLimitError";
import { usePlanLimitHandler } from "@/hooks/usePlanLimitHandler";

const DEFAULT_SCHEDULE = "0 9 * * *";

export function useCreateTask() {
  const { getAccessToken } = usePrivy();
  const { selectedArtist } = useArtistProvider();
  const queryClient = useQueryClient();
  const router = useRouter();
  const { handlePlanLimit } = usePlanLimitHandler();

  const { mutate: handleCreateTask, isPending: isCreating } = useMutation({
    mutationFn: async () => {
      const artistAccountId = selectedArtist?.account_id;
      if (!artistAccountId) {
        throw new Error("ARTIST_REQUIRED");
      }
      const accessToken = await getAccessToken();
      if (!accessToken) {
        throw new Error("AUTH_REQUIRED");
      }
      return createTask(accessToken, {
        title: "Untitled Task",
        prompt: "New task — replace with your instructions.",
        schedule: DEFAULT_SCHEDULE,
        artist_account_id: artistAccountId,
        model: DEFAULT_MODEL,
        timezone: getLocalTimezone(),
      });
    },
    onSuccess: async (task) => {
      await queryClient.invalidateQueries({
        queryKey: ["scheduled-actions"],
        exact: false,
      });
      await queryClient.refetchQueries({
        queryKey: ["scheduled-actions"],
        exact: false,
      });
      toast.success("Task created", {
        action: {
          label: "View",
          onClick: () => router.push(getTaskHref(task.id)),
        },
      });
    },
    onError: (error) => {
      if (error instanceof PlanLimitError) {
        handlePlanLimit(error);
        return;
      }
      console.error("Failed to create task:", error);
      if (error instanceof Error) {
        if (error.message === "ARTIST_REQUIRED") {
          toast.error("Please select an artist first.");
          return;
        }
        if (error.message === "AUTH_REQUIRED") {
          toast.error("Please sign in to create a task.");
          return;
        }
      }
      toast.error("Failed to create task. Please try again.");
    },
  });

  return { handleCreateTask, isCreating };
}
