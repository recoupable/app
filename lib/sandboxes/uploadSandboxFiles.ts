import { getClientApiBaseUrl } from "@/lib/api/getClientApiBaseUrl";
import { stageSandboxFiles } from "./stageSandboxFiles";
import { assertFileReplacementGuard } from "./assertFileReplacementGuard";
import { SandboxFileConflictError } from "./SandboxFileConflictError";
import type { FileReplacementGuard } from "./guardedFileTypes";

interface UploadedFile {
  path: string;
  sha: string;
}

interface UploadSandboxFilesResponse {
  status: "success" | "error";
  uploaded?: UploadedFile[];
  errors?: string[];
  error?: string;
  conflicts?: string[];
}

/**
 * Uploads files to the sandbox GitHub repository.
 * Files are first uploaded to Vercel Blob via client-side upload,
 * then blob URLs are sent to the API which commits them to GitHub
 * and cleans up the blobs.
 *
 * @param accessToken - The Privy access token for authentication
 * @param files - Array of File objects to upload
 * @param path - Target directory path within the repository (optional)
 * @param message - Commit message (optional)
 * @returns The upload result with uploaded file details
 */
export async function uploadSandboxFiles({
  accessToken,
  files,
  path,
  message,
  guard,
  assertCurrent,
}: {
  accessToken: string;
  files: File[];
  path?: string;
  message?: string;
  guard?: FileReplacementGuard;
  assertCurrent?: () => void;
}): Promise<{ uploaded: UploadedFile[]; errors?: string[] }> {
  assertCurrent?.();
  if (guard) assertFileReplacementGuard(guard, files, path);
  const apiBaseUrl = guard?.opened.apiBaseUrl ?? getClientApiBaseUrl();
  const { blobFiles, blobErrors } = await stageSandboxFiles(
    accessToken,
    files,
    apiBaseUrl,
    guard?.opened.sha,
  );

  assertCurrent?.();
  if (guard) assertFileReplacementGuard(guard, files, path);
  const response = await fetch(`${apiBaseUrl}/api/sandboxes/files`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      files: blobFiles,
      path,
      message,
    }),
  });

  const data: UploadSandboxFilesResponse = await response.json();
  if (guard && (response.status === 409 || data.conflicts?.length))
    throw new SandboxFileConflictError();

  if (!response.ok || data.status === "error") {
    throw new Error(data.error || "Failed to upload files");
  }
  if (
    guard &&
    (data.errors?.length ||
      data.uploaded?.length !== 1 ||
      !/^[a-f0-9]{40}$/.test(data.uploaded[0].sha))
  ) {
    throw new Error(
      "The saved revision could not be confirmed. Your replacement has been kept.",
    );
  }

  const allErrors = [...blobErrors, ...(data.errors || [])];

  return {
    uploaded: data.uploaded || [],
    ...(allErrors.length > 0 && { errors: allErrors }),
  };
}
