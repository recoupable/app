import { Tables } from "@/types/database.types";
import { getFilesByArtistId } from "./getFilesByArtistId";
import { filterFilesByPath } from "@/lib/files/filterFilesByPath";

type FileRecord = Tables<"files">;

/**
 * List files for an artist, optionally filtered by path
 *
 * This is a convenience function that combines:
 * 1. Database query (getFilesByArtistId)
 * 2. Path filtering logic (filterFilesByPath)
 *
 * Note: With file sharing enabled, this returns files from ALL team members
 * who have access to the artist, not just the specified owner.
 *
 * @param ownerAccountId - Currently unused, kept for backward compatibility
 * @param artistAccountId - The artist account to get files for
 * @param path - Optional path filter for immediate children only
 * @param recursive - If true, returns all files (and nested files) under the path (or all files if no path)
 */
export async function listFilesByArtist(
  ownerAccountId: string,
  artistAccountId: string,
  path?: string,
  recursive: boolean = false,
): Promise<FileRecord[]> {
  // Get all files for the artist from database
  const allFiles = await getFilesByArtistId(artistAccountId);

  if (recursive) {
    if (path) {
      // Basic prefix filtering for recursive mode
      const pathPrefix = path.endsWith("/") ? path : path + "/";
      return allFiles.filter(f => {
        const match = f.storage_key.match(/^files\/[^\/]+\/[^\/]+\/(.+)$/);
        if (!match) return false;
        const relativePath = match[1];
        return relativePath.startsWith(pathPrefix);
      });
    }
    return allFiles;
  }

  // Apply path filtering logic
  return filterFilesByPath(allFiles, path);
}
