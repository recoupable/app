import { useState } from "react";
import { toast } from "react-toastify";
import { Tables } from "@/types/database.types";
import { useQueryClient } from "@tanstack/react-query";
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

  const updateAction = async ({
    updates,
    onSuccess,
    successMessage = "Updated successfully",
  }: UpdateScheduledActionParams) => {
    setIsLoading(true);
    try {
      const updatedTask = await updateTask(updates);

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
