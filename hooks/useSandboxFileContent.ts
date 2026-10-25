import { useCallback, useState } from "react";
import { useSandboxFileQuery } from "./useSandboxFileQuery";
import type { OpenedFileRevision } from "@/lib/sandboxes/guardedFileTypes";

interface UseSandboxFileContentOptions {
  path?: string;
  enabled?: boolean;
  includeRevision?: boolean;
}

interface UseSandboxFileContentReturn {
  selectedPath: string | undefined;
  content: string | null;
  imageUrl: string | null;
  loading: boolean;
  error: string | null;
  select: (path: string) => void;
  openedRevision?: OpenedFileRevision;
  scopeKey: string;
  reopen: (path: string) => void;
}

export default function useSandboxFileContent(
  options?: UseSandboxFileContentOptions,
): UseSandboxFileContentReturn {
  const [selectedPath, setSelectedPath] = useState<string | undefined>(
    options?.path,
  );
  const effectivePath = options?.path ?? selectedPath;
  const enabled = options?.enabled ?? true;

  const { query, scopeKey, reopen, ready } = useSandboxFileQuery(
    effectivePath,
    enabled,
    options?.includeRevision ?? false,
  );

  const select = useCallback(
    (path: string) => {
      setSelectedPath(path);
      reopen(path);
    },
    [reopen],
  );

  return {
    selectedPath: effectivePath,
    content: !ready || query.error ? null : (query.data?.content ?? null),
    imageUrl: !ready || query.error ? null : (query.data?.imageUrl ?? null),
    loading: ready && (query.isLoading || query.isFetching),
    error: query.error?.message ?? null,
    select,
    openedRevision:
      !ready || query.error || query.isFetching
        ? undefined
        : query.data?.openedRevision,
    scopeKey,
    reopen: select,
  };
}
