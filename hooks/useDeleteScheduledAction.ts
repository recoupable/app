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

/** Internal sentinel when no bearer token is available (caller must not treat delete as success). */
const DELETE_WITHOUT_ACCESS_TOKEN = "DELETE_WITHOUT_ACCESS_TOKEN";

export const useDeleteScheduledAction = () => {
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();
  const { getAccessToken } = usePrivy();

  const deleteAction = async ({
    actionId,
    onSuccess,
    successMessage = "Scheduled action deleted successfully",
  }: DeleteScheduledActionParams) => {
    setIsLoading(true);
    try {
      const accessToken = await getAccessToken();
      if (!accessToken) {
        throw new Error(DELETE_WITHOUT_ACCESS_TOKEN);
      }

      await deleteTask(accessToken, { id: actionId });

      onSuccess?.();
      toast.success(successMessage);
      return;
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === DELETE_WITHOUT_ACCESS_TOKEN
      ) {
        throw error;
      }
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
