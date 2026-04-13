import { useCallback, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { usePrivy } from "@privy-io/react-auth";
import { getFileContents } from "@/lib/sandboxes/getFileContents";

interface UseSandboxFileContentOptions {
  path?: string;
  enabled?: boolean;
}

interface UseSandboxFileContentReturn {
  selectedPath: string | undefined;
  content: string | null;
  imageUrl: string | null;
  loading: boolean;
  error: string | null;
  select: (path: string) => void;
}

export default function useSandboxFileContent(
  options?: UseSandboxFileContentOptions,
): UseSandboxFileContentReturn {
  const { getAccessToken } = usePrivy();
  const [selectedPath, setSelectedPath] = useState<string>(options?.path);
  const effectivePath = options?.path ?? selectedPath;
  const enabled = options?.enabled ?? true;

  const query = useQuery({
    queryKey: ["sandbox-file-content", effectivePath],
    enabled: Boolean(enabled && effectivePath),
    queryFn: async () => {
      if (!effectivePath) {
        return { content: null, imageUrl: null };
      }
      const accessToken = await getAccessToken();
      if (!accessToken) {
        throw new Error("Please sign in to view file contents");
      }
      return getFileContents(accessToken, effectivePath);
    },
  });

  const select = useCallback(
    (path: string) => {
      setSelectedPath(path);
    },
    [],
  );

  return {
    selectedPath: effectivePath,
    content: query.data?.content ?? null,
    imageUrl: query.data?.imageUrl ?? null,
    loading: query.isLoading || query.isFetching,
    error: query.error?.message ?? null,
    select,
  };
}
