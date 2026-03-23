"use client";

import { useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { uploadFilesToSandbox } from "@/lib/sandboxes/uploadFilesToSandbox";
import type { UploadFileResult } from "@/lib/sandboxes/uploadFilesToSandbox";

interface UseUploadSandboxFilesReturn {
  upload: (files: File[], folder: string) => Promise<UploadFileResult[]>;
  isUploading: boolean;
  error: string | null;
}

export default function useUploadSandboxFiles(): UseUploadSandboxFilesReturn {
  const { getAccessToken } = usePrivy();
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const upload = async (files: File[], folder: string): Promise<UploadFileResult[]> => {
    setIsUploading(true);
    setError(null);
    try {
      const accessToken = await getAccessToken();
      if (!accessToken) {
        throw new Error("Please sign in to upload files");
      }
      const response = await uploadFilesToSandbox(accessToken, files, folder);
      if (response.status === "error") {
        throw new Error(response.error ?? "Upload failed");
      }
      return response.uploaded ?? [];
    } catch (err) {
      const message = err instanceof Error ? err.message : "Upload failed";
      setError(message);
      return [];
    } finally {
      setIsUploading(false);
    }
  };

  return { upload, isUploading, error };
}
