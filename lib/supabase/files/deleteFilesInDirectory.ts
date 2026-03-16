import supabase from "@/lib/supabase/serverClient";
import { escapeLikePattern } from "@/lib/files/escapeLikePattern";

type FileRecord = {
  id: string;
  storage_key: string;
};

/**
 * Apply common filters to a query (LIKE pattern and optional exclude)
 * Note: Uses 'any' type to work with Supabase's dynamic query builder API
 *
 * @param query - Base Supabase query to apply filters to
 * @param escapedPattern - Escaped LIKE pattern
 * @param excludeId - Optional ID to exclude from results
 * @returns Query with filters applied
 */
function applyDirectoryFilters(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  query: any,
  escapedPattern: string,
  excludeId?: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): any {
  let filteredQuery = query.like("storage_key", escapedPattern);

  if (excludeId) {
    filteredQuery = filteredQuery.neq("id", excludeId);
  }

  return filteredQuery;
}

/**
 * Delete all file records in a directory (recursive)
 * Returns array of storage keys that need to be deleted from storage
 *
 * @param directoryStorageKey - Storage key of the directory (used as prefix match)
 * @param excludeId - Optional file ID to exclude from deletion (e.g., the directory itself)
 * @returns Array of storage keys that were deleted from database
 * @throws Error if database operation fails
 */
export async function deleteFilesInDirectory(
  directoryStorageKey: string,
  excludeId?: string,
): Promise<string[]> {
  // Sanitize input by escaping special LIKE wildcard characters
  const escapedKey = escapeLikePattern(directoryStorageKey);
  const escapedPattern = `${escapedKey}%`;

  // Build select query with common filters
  const selectQuery = applyDirectoryFilters(
    supabase.from("files").select("id, storage_key"),
    escapedPattern,
    excludeId,
  );

  const { data: childFiles, error: selectError } = await selectQuery;

  if (selectError) {
    throw new Error(`Failed to find files in directory: ${selectError.message}`);
  }

  if (!childFiles || childFiles.length === 0) {
    return [];
  }

  const storageKeys = childFiles.map((f: FileRecord) => f.storage_key);

  // Build delete query with the same common filters
  const deleteQuery = applyDirectoryFilters(
    supabase.from("files").delete(),
    escapedPattern,
    excludeId,
  );

  const { error: deleteError } = await deleteQuery;

  if (deleteError) {
    throw new Error(`Failed to delete file records: ${deleteError.message}`);
  }

  return storageKeys;
}
