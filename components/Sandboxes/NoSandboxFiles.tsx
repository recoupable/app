"use client";

import { useDragAndDrop } from "@/hooks/useDragAndDrop";
import { Upload } from "lucide-react";
import { cn } from "@/lib/utils";

interface NoSandboxFilesProps {
  onDrop: (files: File[]) => void;
  disabled: boolean;
}

export default function NoSandboxFiles({
  onDrop,
  disabled,
}: NoSandboxFilesProps) {
  const { getRootProps, getInputProps, isDragging } = useDragAndDrop({
    onDrop,
    maxFiles: 100,
    maxSizeMB: 100,
    disabled,
  });

  return (
    <div className="w-full max-w-md min-h-[400px]">
      <div
        {...getRootProps()}
        role="region"
        aria-label="File upload dropzone"
        className={cn(
          "w-full max-w-md rounded-lg p-8 border-2 border-dashed transition-all",
          // Note: Intentionally NOT using cursor-pointer here. Since click-to-upload
          // is disabled (see noClick: true in useDragAndDrop hook), showing a hand
          // cursor would mislead users into thinking clicking opens a file picker.
          isDragging
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25",
        )}
      >
        <input {...getInputProps()} aria-label="Upload files" />
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Upload className="h-8 w-8" />
          <div className="space-y-2 text-center">
            <h2 className="text-base font-medium text-foreground">
              Repository Files
            </h2>
            <p className="text-sm">
              No files yet. Drag and drop files here to upload them into the agent sandbox workspace.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
