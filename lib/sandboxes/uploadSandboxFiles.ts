import { NEW_API_BASE_URL } from "@/lib/consts";
import { upload } from "@vercel/blob/client";

interface UploadedFile {
  path: string;
  sha: string;
}

interface UploadSandboxFilesResponse {
  status: "success" | "error";
  uploaded?: UploadedFile[];
  errors?: string[];
  error?: string;
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
}: {
  accessToken: string;
  files: File[];
  path?: string;
  message?: string;
}): Promise<{ uploaded: UploadedFile[]; errors?: string[] }> {
  const results = await Promise.allSettled(
    files.map(async (file) => {
      const blob = await upload(file.name, file, {
        access: "public",
        handleUploadUrl: "/api/sandbox/upload",
        clientPayload: JSON.stringify({ token: accessToken }),
      });
      return { url: blob.url, name: file.name };
    }),
  );

  const blobFiles: { url: string; name: string }[] = [];
  const blobErrors: string[] = [];

  results.forEach((r, i) => {
    if (r.status === "fulfilled") {
      blobFiles.push(r.value);
    } else {
      blobErrors.push(`${files[i].name}: ${r.reason?.message || "Upload failed"}`);
    }
  });

  if (blobFiles.length === 0) {
    throw new Error(
      blobErrors[0] || "Failed to upload files to temporary storage",
    );
  }

  const response = await fetch(`${NEW_API_BASE_URL}/api/sandboxes/files`, {
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

  if (!response.ok || data.status === "error") {
    throw new Error(data.error || "Failed to upload files");
  }

  const allErrors = [...blobErrors, ...(data.errors || [])];

  return {
    uploaded: data.uploaded || [],
    ...(allErrors.length > 0 && { errors: allErrors }),
  };
}
