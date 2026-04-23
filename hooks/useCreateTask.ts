"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { usePrivy } from "@privy-io/react-auth";
import { toast } from "sonner";
import { createTask } from "@/lib/tasks/createTask";
import { useArtistProvider } from "@/providers/ArtistProvider";
import { DEFAULT_MODEL } from "@/lib/consts";

const DEFAULT_SCHEDULE = "0 9 * * *";

function clickTaskDialogTrigger(taskId: string) {
  requestAnimationFrame(() => {
    document
      .querySelector<HTMLElement>(`[data-task-dialog-trigger="${taskId}"]`)
      ?.click();
  });
}

export function useCreateTask() {
  const { getAccessToken } = usePrivy();
  const { selectedArtist } = useArtistProvider();
  const queryClient = useQueryClient();

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
          onClick: () => clickTaskDialogTrigger(task.id),
        },
      });
    },
    onError: (error) => {
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
