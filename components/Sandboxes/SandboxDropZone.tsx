"use client";

import type { ReactNode } from "react";
import { useDragAndDrop } from "@/hooks/useDragAndDrop";
import { Loader, Upload } from "lucide-react";
import { cn } from "@/lib/utils";

interface SandboxDropZoneProps {
  onDrop: (files: File[]) => void;
  uploading: boolean;
  children: ReactNode;
}

/**
 * Drop zone wrapper for sandbox file uploads.
 * Provides drag-and-drop UI overlay and file validation.
 */
export default function SandboxDropZone({
  onDrop,
  uploading,
  children,
}: SandboxDropZoneProps) {
  const { getRootProps, getInputProps, isDragging } = useDragAndDrop({
    onDrop,
    maxFiles: 100,
    maxSizeMB: 100,
    disabled: uploading,
  });

  return (
    <div
      {...getRootProps()}
      role="region"
      aria-label="Repository file tree with file upload"
      aria-busy={uploading}
      className={cn(
        "flex w-full flex-col gap-4 lg:flex-row rounded-lg transition-all relative",
        isDragging && "ring-2 ring-primary ring-offset-2 bg-primary/5",
      )}
    >
      <input {...getInputProps()} aria-label="Upload files to repository" />

      {isDragging && (
        <div className="absolute inset-0 flex items-center justify-center bg-primary/10 backdrop-blur-sm rounded-lg z-10 pointer-events-none">
          <div className="flex flex-col items-center gap-3 text-primary">
            <Upload className="h-12 w-12 animate-bounce" />
            <p className="text-lg font-medium">
              Drop files to upload to repository
            </p>
          </div>
        </div>
      )}

      {uploading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm rounded-lg z-10">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader className="h-4 w-4 animate-spin" />
            <span>Uploading...</span>
          </div>
        </div>
      )}

      {children}
    </div>
  );
}
