import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { updateFileContent, type UpdateFileParams } from "@/lib/files/updateFileContent";

/**
 * TanStack Query mutation hook for updating file content
 * Handles cache invalidation and user feedback via toasts
 */
export function useUpdateFile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: UpdateFileParams) => updateFileContent(params),
    onSuccess: data => {
      // Invalidate the file content cache to refetch updated content
      queryClient.invalidateQueries({
        queryKey: ["file-content", data.storageKey],
      });

      toast.success("File saved successfully");
    },
    onError: (error: Error) => {
      console.error("Failed to update file:", error);
      toast.error(error.message || "Failed to save file. Please try again.");
    },
  });
}
