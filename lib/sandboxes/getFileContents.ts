import { getClientApiBaseUrl } from "@/lib/api/getClientApiBaseUrl";
import { getMimeFromPath } from "@/lib/files/getMimeFromPath";
import { getGuardedGitApiBaseUrl } from "./getGuardedGitApiBaseUrl";

interface GetFileContentsResponse {
  status: "success" | "error";
  content?: string;
  encoding?: "base64";
  error?: string;
  sha?: string;
  account_id?: string;
}

interface FileContentsResult {
  content: string | null;
  imageUrl: string | null;
  sha?: string;
}

/**
 * Fetches file content from the sandbox file API.
 * The API auto-detects binary files and returns base64-encoded content.
 * When base64 content is returned, this builds a data URL for image preview.
 */
export async function getFileContents(
  accessToken: string,
  path: string,
  options?: { includeRevision?: boolean; accountId?: string | null },
): Promise<FileContentsResult> {
  if (options?.includeRevision && options.accountId)
    throw new Error("Files for a selected account are read-only.");
  const apiBaseUrl = options?.includeRevision
    ? getGuardedGitApiBaseUrl()
    : getClientApiBaseUrl();
  if (!apiBaseUrl)
    throw new Error(
      "Protected replacement is not enabled for this connection.",
    );
  const url = new URL(`${apiBaseUrl}/api/sandboxes/file`);
  url.searchParams.set("path", path);
  if (options?.includeRevision)
    url.searchParams.set("include_revision", "true");
  if (options?.accountId) url.searchParams.set("account_id", options.accountId);
  const response = await fetch(url.toString(), {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    cache: "no-store",
  });

  const data: GetFileContentsResponse = await response.json();

  if (
    !response.ok ||
    data.status === "error" ||
    typeof data.content !== "string"
  ) {
    throw new Error(data.error || "Failed to fetch file contents");
  }
  if (options?.includeRevision && !/^[a-f0-9]{40}$/.test(data.sha ?? "")) {
    throw new Error(
      "This connection did not return an opened file revision. Replacement is blocked.",
    );
  }
  if (options?.accountId && data.account_id !== options.accountId)
    throw new Error(
      "This connection did not confirm the selected account. Files are unavailable.",
    );
  const revision = options?.includeRevision ? { sha: data.sha } : {};

  if (data.encoding === "base64") {
    const mimeType = getMimeFromPath(path);
    return {
      content: null,
      imageUrl: `data:${mimeType};base64,${data.content}`,
      ...revision,
    };
  }

  return { content: data.content, imageUrl: null, ...revision };
}
