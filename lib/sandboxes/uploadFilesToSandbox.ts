import { NEW_API_BASE_URL } from "@/lib/consts";

export interface UploadFileResult {
  path: string;
  success: boolean;
  error?: string;
}

export interface UploadFilesResponse {
  status: "success" | "error";
  uploaded?: UploadFileResult[];
  error?: string;
}

/**
 * Uploads files to the account's GitHub org submodule via the sandbox files API.
 *
 * @param accessToken - Privy access token for authentication
 * @param files - Array of File objects to upload
 * @param folder - Target folder path within the repo (e.g. ".openclaw/workspace/orgs/myorg")
 * @returns Upload results per file
 */
export async function uploadFilesToSandbox(
  accessToken: string,
  files: File[],
  folder: string,
): Promise<UploadFilesResponse> {
  const formData = new FormData();
  for (const file of files) {
    formData.append("files", file);
  }
  formData.append("folder", folder);

  const response = await fetch(`${NEW_API_BASE_URL}/api/sandboxes/files`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: formData,
  });

  const data: UploadFilesResponse = await response.json();
  return data;
}
