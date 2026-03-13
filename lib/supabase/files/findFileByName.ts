import supabase from "@/lib/supabase/serverClient";
import { Tables } from "@/types/database.types";
import { escapePostgrestValue } from "./escapePostgrestValue";
import { isValidPath } from "@/utils/isValidPath";

type FileRecord = Tables<"files">;

/**
 * Find a file by name within artist context
 * Searches in the artist's file storage directory
 *
 * @param fileName
 * @param ownerAccountId
 * @param artistAccountId
 * @param path
 */
export async function findFileByName(
  fileName: string,
  ownerAccountId: string,
  artistAccountId: string,
  path?: string,
): Promise<FileRecord | null> {
  // Validate path to prevent directory traversal attacks
  if (path && !isValidPath(path)) {
    throw new Error(
      "Invalid path: paths cannot contain directory traversal sequences (.., ./), " +
        "backslashes, control characters, or be absolute paths",
    );
  }

  // Normalize path: remove leading/trailing slashes
  const normalizedPath = path?.replace(/^\/+|\/+$/g, "");

  // Find by artist and filename only (matches any owner who shares this artist)
  const { data, error } = await supabase
    .from("files")
    .select()
    .eq("artist_account_id", artistAccountId)
    .eq("file_name", fileName)
    .order("created_at", { ascending: false });

  if (error) {
    return null;
  }

  if (!data || data.length === 0) {
    // Try with filename normalization (spaces ↔ underscores)
    const fileNameWithSpaces = fileName.replace(/_/g, " ");
    const fileNameWithUnderscores = fileName.replace(/ /g, "_");

    const { data: normalizedData } = await supabase
      .from("files")
      .select()
      .eq("artist_account_id", artistAccountId)
      .or(
        `file_name.eq.${escapePostgrestValue(fileNameWithSpaces)},file_name.eq.${escapePostgrestValue(fileNameWithUnderscores)}`,
      )
      .order("created_at", { ascending: false });

    if (!normalizedData || normalizedData.length === 0) {
      return null;
    }

    // Filter by path if specified
    const filtered = normalizedPath
      ? normalizedData.filter(file => {
          const match = file.storage_key.match(/^files\/[^\/]+\/[^\/]+\/(.+)$/);
          if (!match) return false;
          const relativePath = match[1];
          const expectedPrefix = normalizedPath + "/";
          return relativePath.startsWith(expectedPrefix);
        })
      : normalizedData.filter(file => {
          const match = file.storage_key.match(/^files\/[^\/]+\/[^\/]+\/([^\/]+)\/?$/);
          return !!match;
        });

    return filtered[0] || null;
  }

  // Filter by path if specified
  const filtered = normalizedPath
    ? data.filter(file => {
        const match = file.storage_key.match(/^files\/[^\/]+\/[^\/]+\/(.+)$/);
        if (!match) return false;
        const relativePath = match[1];
        const expectedPrefix = normalizedPath + "/";
        return relativePath.startsWith(expectedPrefix);
      })
    : data.filter(file => {
        const match = file.storage_key.match(/^files\/[^\/]+\/[^\/]+\/([^\/]+)\/?$/);
        return !!match;
      });

  return filtered[0] || null;
}
