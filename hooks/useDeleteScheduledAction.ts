import { useState } from "react";
import { toast } from "react-toastify";
import { useQueryClient } from "@tanstack/react-query";
import { usePrivy } from "@privy-io/react-auth";
import { deleteTask } from "@/lib/tasks/deleteTask";

interface DeleteScheduledActionParams {
  actionId: string;
  onSuccess?: () => void;
  successMessage?: string;
}

export const useDeleteScheduledAction = () => {
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();
  const { getAccessToken, authenticated } = usePrivy();

  const deleteAction = async ({
    actionId,
    onSuccess,
    successMessage = "Scheduled action deleted successfully",
  }: DeleteScheduledActionParams) => {
    setIsLoading(true);
    try {
      if (!authenticated) {
        return;
      }

      const accessToken = await getAccessToken();
      if (!accessToken) {
        return;
      }

      await deleteTask(accessToken, { id: actionId });

      onSuccess?.();
      toast.success(successMessage);
      return;
    } catch (error) {
      console.error("Failed to delete scheduled action:", error);
      toast.error("Failed to delete. Please try again.");
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
    deleteAction,
    isLoading,
  };
};
