import { useMutation } from "@tanstack/react-query";
import { usePrivy } from "@privy-io/react-auth";
import { uploadSandboxFiles } from "@/lib/sandboxes/uploadSandboxFiles";
import { findFileNode } from "@/lib/sandboxes/findFileNode";
import { toast } from "sonner";
import type { FileNode } from "@/lib/sandboxes/parseFileTree";
import { useSandboxAccountScope } from "./useSandboxAccountScope";

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
  const scope = useSandboxAccountScope();

  const mutation = useMutation({
    mutationFn: async (files: File[]) => {
      const assertCurrent = () => {
        if (!scope.ready)
          throw new Error(
            "Please sign in and select an account to upload files.",
          );
        if (scope.readOnly)
          throw new Error("Files for a selected account are read-only.");
        if (!scope.isCurrent())
          throw new Error(
            "The account or connection changed. Select the upload again.",
          );
      };
      assertCurrent();
      const accessToken = await getAccessToken();
      if (!accessToken) {
        throw new Error("Please sign in to upload files");
      }
      assertCurrent();

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

      const result = await uploadSandboxFiles({
        accessToken,
        files,
        path: targetPath,
        assertCurrent,
      });
      return { ...result, isCurrent: scope.isCurrent };
    },
    onSuccess: (result) => {
      if (!result.isCurrent()) return;
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
