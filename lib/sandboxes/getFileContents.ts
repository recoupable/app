import { NEW_API_BASE_URL } from "@/lib/consts";

interface GetFileContentsResponse {
  status: "success" | "error";
  content?: string;
  error?: string;
}

/**
 *
 * @param accessToken
 * @param path
 */
export async function getFileContents(
  accessToken: string,
  path: string,
): Promise<{ content: string }> {
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

  if (!response.ok || data.status === "error") {
    throw new Error(data.error || "Failed to fetch file contents");
  }

  return { content: data.content || "" };
}
