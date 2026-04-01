import { NEW_API_BASE_URL } from "@/lib/consts";
import { getMimeFromPath } from "@/lib/files/getMimeFromPath";

interface GetFileContentsResponse {
  status: "success" | "error";
  content?: string;
  encoding?: "base64";
  error?: string;
}

interface FileContentsResult {
  content: string | null;
  imageUrl: string | null;
}

/**
 * Fetches file content from the sandbox file API.
 * The API auto-detects binary files and returns base64-encoded content.
 * When base64 content is returned, this builds a data URL for image preview.
 */
export async function getFileContents(
  accessToken: string,
  path: string,
): Promise<FileContentsResult> {
  const response = await fetch(
    `${NEW_API_BASE_URL}/api/sandboxes/file?path=${encodeURIComponent(path)}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  const data: GetFileContentsResponse = await response.json();

  if (!response.ok || data.status === "error" || !data.content) {
    throw new Error(data.error || "Failed to fetch file contents");
  }

  if (data.encoding === "base64") {
    const mimeType = getMimeFromPath(path);
    return {
      content: null,
      imageUrl: `data:${mimeType};base64,${data.content}`,
    };
  }

  return { content: data.content, imageUrl: null };
}
