"use client";

import { FileTree } from "@/components/ai-elements/file-tree";
import FileNodeComponent from "./FileNodeComponent";
import SandboxFilePreview from "./SandboxFilePreview";
import useSandboxes from "@/hooks/useSandboxes";
import useSandboxFileContent from "@/hooks/useSandboxFileContent";
import { Loader } from "lucide-react";

export default function SandboxFileTree() {
  const { filetree, isLoading, error, refetch } = useSandboxes();
  const fileContent = useSandboxFileContent();

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
        <button
          onClick={() => refetch()}
          className="text-sm underline hover:no-underline"
        >
          Try again
        </button>
      </div>
    );
  }

  if (filetree.length === 0) {
    return (
      <div className="w-full max-w-md">
        <p className="text-sm text-muted-foreground">No files yet.</p>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col gap-4 lg:flex-row">
      <div className="w-full lg:max-w-md lg:shrink-0">
        <h2 className="mb-2 text-lg font-medium">Repository Files</h2>
        <FileTree
          selectedPath={fileContent.selectedPath}
          onSelect={fileContent.select}
        >
          {filetree.map((node) => (
            <FileNodeComponent key={node.path} node={node} />
          ))}
        </FileTree>
      </div>
      {fileContent.selectedPath && (
        <SandboxFilePreview
          selectedPath={fileContent.selectedPath}
          content={fileContent.content}
          imageUrl={fileContent.imageUrl}
          loading={fileContent.loading}
          error={fileContent.error}
        />
      )}
    </div>
  );
}
