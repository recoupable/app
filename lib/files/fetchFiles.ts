import { getClientApiBaseUrl } from "@/lib/api/getClientApiBaseUrl";

interface FetchFilesParams {
  accessToken: string;
  artistAccountId: string;
  path?: string;
  recursive?: boolean;
}

export interface ListedFileRow {
  id: string;
  file_name: string;
  storage_key: string;
  mime_type: string | null;
  is_directory?: boolean;
}

interface FetchFilesResponse {
  files: ListedFileRow[];
}

export async function fetchFiles({
  accessToken,
  artistAccountId,
  path,
  recursive = false,
}: FetchFilesParams): Promise<FetchFilesResponse> {
  const url = new URL(`${getClientApiBaseUrl()}/api/files`);
  url.searchParams.set("artist_account_id", artistAccountId);

  if (path) {
    url.searchParams.set("path", path);
  }

  if (recursive) {
    url.searchParams.set("recursive", "true");
  }

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP ${response.status}: ${errorText}`);
  }

  return response.json();
}
