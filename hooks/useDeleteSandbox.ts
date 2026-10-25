import { useMutation, useQueryClient } from "@tanstack/react-query";
import { usePrivy } from "@privy-io/react-auth";
import { toast } from "sonner";
import { deleteSandbox } from "@/lib/sandboxes/deleteSandbox";
import { useSandboxAccountScope } from "./useSandboxAccountScope";

interface UseDeleteSandboxReturn {
  deleteSandbox: () => Promise<void>;
  isDeleting: boolean;
  readOnly: boolean;
}

export default function useDeleteSandbox(): UseDeleteSandboxReturn {
  const { getAccessToken } = usePrivy();
  const scope = useSandboxAccountScope();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async () => {
      if (!scope.ready)
        throw new Error(
          "Please sign in and select an account to delete files.",
        );
      if (scope.readOnly)
        throw new Error("Files for a selected account are read-only.");
      if (!scope.isCurrent())
        throw new Error("The account or connection changed. Try again.");
      const accessToken = await getAccessToken();
      if (!accessToken) {
        throw new Error("Please sign in to delete sandbox");
      }
      if (!scope.isCurrent())
        throw new Error("The account or connection changed. Try again.");
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
    readOnly: scope.readOnly,
  };
}
