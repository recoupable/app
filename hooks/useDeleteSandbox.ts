import { useMutation, useQueryClient } from "@tanstack/react-query";
import { usePrivy } from "@privy-io/react-auth";
import { toast } from "sonner";
import { deleteSandbox } from "@/lib/sandboxes/deleteSandbox";

interface UseDeleteSandboxReturn {
  deleteSandbox: () => Promise<void>;
  isDeleting: boolean;
}

/**
 *
 */
export default function useDeleteSandbox(): UseDeleteSandboxReturn {
  const { getAccessToken } = usePrivy();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async () => {
      const accessToken = await getAccessToken();
      if (!accessToken) {
        throw new Error("Please sign in to delete sandbox");
      }
      return deleteSandbox(accessToken);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sandboxes"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete sandbox");
    },
  });

  const deleteSandboxHandler = async (): Promise<void> => {
    return mutation.mutateAsync();
  };

  return {
    deleteSandbox: deleteSandboxHandler,
    isDeleting: mutation.isPending,
  };
}
