"use client";

import FilePreview from "@/components/Files/FilePreview";
import { isTextFile } from "@/utils/isTextFile";

interface SandboxFilePreviewProps {
  selectedPath: string;
  content: string | null;
  imageUrl: string | null;
  loading: boolean;
  error: string | null;
}

export default function SandboxFilePreview({
  selectedPath,
  content,
  imageUrl,
  loading,
  error,
}: SandboxFilePreviewProps) {
  const fileName = selectedPath.split("/").pop() ?? "";

  return (
    <div className="min-w-0 flex-1">
      <h2 className="mb-2 text-lg font-medium truncate">{fileName}</h2>
      <FilePreview
        content={content}
        loading={loading}
        error={error}
        isTextFile={isTextFile(fileName)}
        fileName={fileName}
        imageUrl={imageUrl ?? undefined}
      />
    </div>
  );
}
