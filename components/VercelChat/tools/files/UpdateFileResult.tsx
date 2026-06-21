"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Check, FileEdit } from "lucide-react";
import Link from "next/link";
import { ToolCard, ToolCardBody, ToolCardRow } from "../shared/ToolCard";
import ToolError from "../shared/ToolError";

/**
 * Result type returned by the update_file tool
 */
export type UpdateFileResultType = {
  success: boolean;
  verified?: boolean;
  storageKey?: string;
  fileName?: string;
  sizeBytes?: number;
  path?: string;
  message?: string;
  error?: string;
};

interface UpdateFileResultProps {
  result: UpdateFileResultType;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

/**
 * Component to display update_file tool results
 * Automatically invalidates the file content cache to refresh the UI
 */
export function UpdateFileResult({ result }: UpdateFileResultProps) {
  const queryClient = useQueryClient();

  // Invalidate cache when component mounts (file was updated)
  useEffect(() => {
    if (result.success && result.storageKey) {
      // Invalidate the specific file's content cache
      queryClient.invalidateQueries({
        queryKey: ["file-content", result.storageKey],
      });
    }
  }, [result.success, result.storageKey, queryClient]);

  if (!result.success) {
    return (
      <ToolError
        title="Update file"
        message={result.error || result.message || "Failed to update file"}
      />
    );
  }

  const fileName = result.fileName?.trim();
  const meta: string[] = [];
  if (result.verified) meta.push("Verified");
  if (result.sizeBytes !== undefined) meta.push(formatBytes(result.sizeBytes));

  return (
    <ToolCard
      icon={FileEdit}
      tone="success"
      title={fileName ? `Updated ${fileName}` : "File updated"}
      subtitle={meta.length > 0 ? meta.join(" · ") : undefined}
      className="max-w-md"
      trailing={
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
          <Check className="size-3" strokeWidth={3} />
          Saved
        </span>
      }
    >
      {result.path ? (
        <ToolCardBody>
          <Link
            href={result.path}
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            <ToolCardRow className="cursor-pointer">
              <FileEdit className="size-4 shrink-0 text-muted-foreground" />
              <span className="min-w-0 flex-1 truncate font-mono text-xs text-foreground">
                {result.path}
              </span>
            </ToolCardRow>
          </Link>
        </ToolCardBody>
      ) : null}
    </ToolCard>
  );
}
