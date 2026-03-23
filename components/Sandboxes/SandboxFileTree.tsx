"use client";

import { useState, useCallback } from "react";
import { FileTree } from "@/components/ai-elements/file-tree";
import FileNodeComponent from "./FileNodeComponent";
import SandboxFilePreview from "./SandboxFilePreview";
import useSandboxes from "@/hooks/useSandboxes";
import useSandboxFileContent from "@/hooks/useSandboxFileContent";
import useUploadSandboxFiles from "@/hooks/useUploadSandboxFiles";
import { useDragAndDrop } from "@/hooks/useDragAndDrop";
import { toast } from "sonner";
import { Loader, Upload } from "lucide-react";
import type { FileNode } from "@/lib/sandboxes/parseFileTree";

function getFirstFolderPath(nodes: FileNode[]): string {
  for (const node of nodes) {
    if (node.type === "folder") return node.path;
  }
  return "";
}

function getParentFolder(filePath: string): string {
  const parts = filePath.split("/");
  parts.pop();
  return parts.join("/");
}

export default function SandboxFileTree() {
  const { filetree, isLoading, error, refetch } = useSandboxes();
  const fileContent = useSandboxFileContent();
  const { upload, isUploading } = useUploadSandboxFiles();
  const [dropFolder, setDropFolder] = useState<string>("");

  const resolvedDropFolder =
    dropFolder ||
    (fileContent.selectedPath ? getParentFolder(fileContent.selectedPath) : "") ||
    getFirstFolderPath(filetree);

  const handleDrop = useCallback(
    async (files: File[]) => {
      if (!resolvedDropFolder) {
        toast.error("No folder selected. Select a file or folder first.");
        return;
      }

      toast.loading(`Uploading ${files.length} file${files.length > 1 ? "s" : ""}…`, {
        id: "sandbox-upload",
      });

      const results = await upload(files, resolvedDropFolder);

      const succeeded = results.filter((r) => r.success).length;
      const failed = results.filter((r) => !r.success);

      toast.dismiss("sandbox-upload");

      if (succeeded > 0) {
        toast.success(`${succeeded} file${succeeded > 1 ? "s" : ""} uploaded successfully`);
        refetch();
      }

      for (const f of failed) {
        toast.error(`Failed to upload ${f.path}: ${f.error ?? "unknown error"}`);
      }
    },
    [resolvedDropFolder, upload, refetch],
  );

  const { getRootProps, getInputProps, isDragging } = useDragAndDrop({
    onDrop: handleDrop,
    disabled: isUploading,
  });

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <Loader className="h-4 w-4 animate-spin" />
        <span>Loading files...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-destructive">
        <p>Failed to load files</p>
        <button onClick={() => refetch()} className="text-sm underline hover:no-underline">
          Try again
        </button>
      </div>
    );
  }

  if (filetree.length === 0) {
    return (
      <div {...getRootProps()} className="w-full max-w-md">
        <input {...getInputProps()} />
        <p className="text-sm text-muted-foreground">No files yet.</p>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col gap-4 lg:flex-row">
      <div className="w-full lg:max-w-md lg:shrink-0">
        <div
          {...getRootProps()}
          className={`relative rounded-lg border border-dashed transition-colors ${
            isDragging
              ? "border-primary bg-primary/5"
              : "border-transparent hover:border-muted-foreground/30"
          }`}
        >
          <input {...getInputProps()} />

          {isDragging && (
            <div className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 rounded-lg bg-background/80">
              <Upload className="h-8 w-8 text-primary" />
              <p className="text-sm font-medium text-primary">
                Drop files into{" "}
                <span className="font-mono text-xs">
                  {resolvedDropFolder || "repository root"}
                </span>
              </p>
            </div>
          )}

          <div className="p-1">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-lg font-medium">Repository Files</h2>
              {isUploading && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Loader className="h-3 w-3 animate-spin" />
                  Uploading…
                </span>
              )}
            </div>

            {resolvedDropFolder && (
              <div className="mb-2 flex items-center gap-1">
                <Upload className="h-3 w-3 text-muted-foreground" />
                <p className="truncate font-mono text-xs text-muted-foreground">
                  Drop target:{" "}
                  <button
                    className="underline decoration-dotted hover:text-foreground"
                    onClick={() => setDropFolder("")}
                    title="Reset to default"
                  >
                    {resolvedDropFolder}
                  </button>
                </p>
              </div>
            )}

            <FileTree
              selectedPath={fileContent.selectedPath}
              onSelect={(path) => {
                fileContent.select(path);
                // Update drop folder to parent of selected file
                const parent = getParentFolder(path);
                if (parent) setDropFolder(parent);
              }}
            >
              {filetree.map((node) => (
                <FileNodeComponent key={node.path} node={node} />
              ))}
            </FileTree>
          </div>
        </div>
      </div>
      {fileContent.selectedPath && (
        <SandboxFilePreview
          selectedPath={fileContent.selectedPath}
          content={fileContent.content}
          loading={fileContent.loading}
          error={fileContent.error}
        />
      )}
    </div>
  );
}
