"use client";

import { useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { createTask } from "@/lib/tasks/createTask";
import { Task } from "@/lib/tasks/getTasks";
import { useArtistProvider } from "@/providers/ArtistProvider";
import { DEFAULT_MODEL } from "@/lib/consts";

const DEFAULT_SCHEDULE = "0 9 * * *";

export function useCreateTask() {
  const { getAccessToken } = usePrivy();
  const { selectedArtist } = useArtistProvider();
  const queryClient = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);
  const [createdTask, setCreatedTask] = useState<Task | null>(null);

  const handleCreateTask = async () => {
    const artistAccountId = selectedArtist?.account_id;
    if (!artistAccountId) {
      toast.error("Please select an artist first.");
      return;
    }

    const accessToken = await getAccessToken();
    if (!accessToken) {
      toast.error("Please sign in to create a task.");
      return;
    }

    setIsCreating(true);
    try {
      const task = await createTask(accessToken, {
        title: "Untitled Task",
        prompt: "New task — replace with your instructions.",
        schedule: DEFAULT_SCHEDULE,
        artist_account_id: artistAccountId,
        model: DEFAULT_MODEL,
      });
      setCreatedTask(task);
      queryClient.invalidateQueries({
        queryKey: ["scheduled-actions"],
        exact: false,
      });
    } catch (error) {
      console.error("Failed to create task:", error);
      toast.error("Failed to create task. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  const clearCreatedTask = () => setCreatedTask(null);

  return { handleCreateTask, isCreating, createdTask, clearCreatedTask };
}
