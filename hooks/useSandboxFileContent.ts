import { useCallback, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { usePrivy } from "@privy-io/react-auth";
import { getFileContents } from "@/lib/sandboxes/getFileContents";
import { getImageContent } from "@/lib/sandboxes/getImageContent";
import isImagePath from "@/utils/isImagePath";

interface UseSandboxFileContentReturn {
  selectedPath: string | undefined;
  content: string | null;
  imageUrl: string | null;
  loading: boolean;
  error: string | null;
  select: (path: string) => void;
}

export default function useSandboxFileContent(): UseSandboxFileContentReturn {
  const { getAccessToken } = usePrivy();
  const [selectedPath, setSelectedPath] = useState<string>();

  const mutation = useMutation({
    mutationFn: async (path: string) => {
      const accessToken = await getAccessToken();
      if (!accessToken) {
        throw new Error("Please sign in to view file contents");
      }

      const fileName = path.split("/").pop() ?? "";
      if (isImagePath(fileName)) {
        const dataUrl = await getImageContent(accessToken, path, fileName);
        return { content: null, imageUrl: dataUrl };
      }

      const result = await getFileContents(accessToken, path);
      return { content: result.content, imageUrl: null };
    },
  });

  const select = useCallback(
    (path: string) => {
      setSelectedPath(path);
      mutation.mutate(path);
    },
    [mutation],
  );

  return {
    selectedPath,
    content: mutation.data?.content ?? null,
    imageUrl: mutation.data?.imageUrl ?? null,
    loading: mutation.isPending,
    error: mutation.error?.message ?? null,
    select,
  };
}
