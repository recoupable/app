import { useMutation } from "@tanstack/react-query";
import { usePrivy } from "@privy-io/react-auth";
import { uploadSandboxFiles } from "@/lib/sandboxes/uploadSandboxFiles";
import { findFileNode } from "@/lib/sandboxes/findFileNode";
import { toast } from "sonner";
import type { FileNode } from "@/lib/sandboxes/parseFileTree";

/**
 * Hook that handles sandbox file upload logic using useMutation.
 */
export function useSandboxFileDrop({
  selectedPath,
  filetree,
  refetch,
}: {
  selectedPath: string | null | undefined;
  filetree: FileNode[];
  refetch: () => void;
}) {
  const { getAccessToken } = usePrivy();

  const mutation = useMutation({
    mutationFn: async (files: File[]) => {
      const accessToken = await getAccessToken();
      if (!accessToken) {
        throw new Error("Please sign in to upload files");
      }

      let targetPath: string | undefined;
      if (selectedPath) {
        const node = findFileNode(filetree, selectedPath);
        if (node?.type === "file") {
          const parts = selectedPath.split("/");
          targetPath = parts.slice(0, -1).join("/");
        } else {
          targetPath = selectedPath;
        }
      }

      return uploadSandboxFiles({
        accessToken,
        files,
        path: targetPath,
      });
    },
    onSuccess: (result) => {
      if (result.errors?.length) {
        toast.warning(
          `Uploaded ${result.uploaded.length} files, ${result.errors.length} failed`,
        );
      } else {
        toast.success(
          `Uploaded ${result.uploaded.length} file${result.uploaded.length === 1 ? "" : "s"}`,
        );
      }
      refetch();
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    },
  });

  return { handleFilesDropped: mutation.mutate, uploading: mutation.isPending };
}
