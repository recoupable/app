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
    <div
      {...getRootProps()}
      role="region"
      aria-label="File upload dropzone"
      className={cn(
        "w-full max-w-md rounded-lg p-8 border-2 border-dashed transition-all",
        isDragging
          ? "border-primary bg-primary/5"
          : "border-muted-foreground/25",
      )}
    >
      <input {...getInputProps()} aria-label="Upload files" />
      <div className="flex flex-col items-center gap-3 text-muted-foreground">
        <Upload className="h-8 w-8" />
        <p className="text-sm">
          No files yet. Drag and drop files here to upload.
        </p>
      </div>
    </div>
  );
}
