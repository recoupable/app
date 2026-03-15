import { Tables } from "@/types/database.types";

type FileRecord = Tables<"files">;

/**
 * Filter files by path to get immediate children only
 *
 * This is opinionated business logic that:
 * - Extracts relative paths from storage keys
 * - Filters to immediate children of a directory (no nested files)
 * - Handles trailing slashes consistently
 *
 * @param files - Array of file records to filter
 * @param path - Optional subdirectory path to filter by (e.g., 'reports', 'research/data')
 * @returns Filtered array containing only immediate children
 */
export function filterFilesByPath(files: FileRecord[], path?: string): FileRecord[] {
  return files.filter(file => {
    // Extract relative path from storage key pattern: files/{artistId}/{accountId}/{relativePath}
    const match = file.storage_key.match(/^files\/[^\/]+\/[^\/]+\/(.+)$/);
    if (!match) return false;

    const relativePath = match[1];

    // If a path filter is specified, check if file is in that directory
    if (path) {
      const pathPrefix = path.endsWith("/") ? path : path + "/";
      if (!relativePath.startsWith(pathPrefix)) return false;

      // Get the path relative to the filter
      const relativeToFilter = relativePath.slice(pathPrefix.length);
      const trimmed = relativeToFilter.endsWith("/")
        ? relativeToFilter.slice(0, -1)
        : relativeToFilter;

      // Only include immediate children (no nested paths)
      return trimmed.length > 0 && !trimmed.includes("/");
    }

    // No path filter: only include root-level files
    const trimmed = relativePath.endsWith("/") ? relativePath.slice(0, -1) : relativePath;

    return trimmed.length > 0 && !trimmed.includes("/");
  });
}
