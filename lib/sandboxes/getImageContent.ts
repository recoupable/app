import { NEW_API_BASE_URL } from "@/lib/consts";

interface GetImageContentResponse {
  status: "success" | "error";
  content?: string;
  encoding?: string;
  error?: string;
}

/**
 * Fetches image content as base64 from the sandbox file API.
 * Returns a data URL that can be used as an img src.
 */
export async function getImageContent(
  accessToken: string,
  path: string,
  fileName: string,
): Promise<string> {
  const response = await fetch(
    `${NEW_API_BASE_URL}/api/sandboxes/file?path=${encodeURIComponent(path)}&format=base64`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  const data: GetImageContentResponse = await response.json();

  if (!response.ok || data.status === "error") {
    throw new Error(data.error || "Failed to fetch image");
  }

  const mimeType = getMimeType(fileName);
  return `data:${mimeType};base64,${data.content}`;
}

function getMimeType(fileName: string): string {
  const ext = fileName.toLowerCase().split(".").pop();
  const mimeTypes: Record<string, string> = {
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    gif: "image/gif",
    webp: "image/webp",
    svg: "image/svg+xml",
  };
  return mimeTypes[ext ?? ""] ?? "image/png";
}
