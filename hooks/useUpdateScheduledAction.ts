import { useState } from "react";
import { toast } from "react-toastify";
import { Tables } from "@/types/database.types";
import { useQueryClient } from "@tanstack/react-query";
import { usePrivy } from "@privy-io/react-auth";
import { updateTask, UpdateTaskParams } from "@/lib/tasks/updateTask";

type ScheduledAction = Tables<"scheduled_actions">;

interface UpdateScheduledActionParams {
  updates: UpdateTaskParams;
  onSuccess?: (updatedData: ScheduledAction) => void;
  successMessage?: string;
}

export const useUpdateScheduledAction = () => {
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();
  const { getAccessToken } = usePrivy();

  const updateAction = async ({
    updates,
    onSuccess,
    successMessage = "Updated successfully",
  }: UpdateScheduledActionParams) => {
    setIsLoading(true);
    try {
      const accessToken = await getAccessToken();
      if (!accessToken) {
        toast.error("Please sign in to update tasks");
        throw new Error("Please sign in to update tasks");
      }

      const updatedTask = await updateTask(accessToken, updates);

      onSuccess?.(updatedTask);
      toast.success(successMessage);

      return updatedTask;
    } catch (error) {
      console.error("Failed to update scheduled action:", error);
      toast.error("Failed to update. Please try again.");
      throw error;
    } finally {
      setIsLoading(false);
      queryClient.invalidateQueries({
        queryKey: ["scheduled-actions"],
        exact: false,
      });
    }
  };

  return {
    updateAction,
    isLoading,
  };
};
