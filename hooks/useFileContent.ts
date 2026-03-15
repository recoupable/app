import { useQuery } from "@tanstack/react-query";
import { TEXT_EXTENSIONS } from "@/lib/consts/fileExtensions";
import { fetchFileContent } from "@/lib/files/fetchFileContent";

type UseFileContentResult = {
  content: string | null;
  loading: boolean;
  error: string | null;
  isTextFile: boolean;
};

/**
 * Hook to fetch and manage text file content using TanStack Query
 *
 * @param fileName - Name of the file to fetch
 * @param storageKey - Storage key of the file
 * @param accountId - Account ID of the user requesting access
 */
export function useFileContent(
  fileName: string,
  storageKey: string,
  accountId: string,
): UseFileContentResult {
  const isTextFile = TEXT_EXTENSIONS.some(ext => fileName.toLowerCase().endsWith(ext));

  const { data, isLoading, error } = useQuery({
    queryKey: ["file-content", storageKey, accountId],
    queryFn: () => fetchFileContent(storageKey, accountId),
    enabled: isTextFile && Boolean(accountId),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    content: data ?? null,
    loading: isLoading,
    error: error ? (error instanceof Error ? error.message : "Failed to load file") : null,
    isTextFile,
  };
}
