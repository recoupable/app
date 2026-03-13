import supabase from "@/lib/supabase/serverClient";
import { escapeLikePattern } from "@/lib/files/escapeLikePattern";

type FileRecord = {
  id: string;
  storage_key: string;
};

/**
 * Get all file records in a directory (without deleting them)
 * Used to retrieve child files before performing storage operations
 *
 * @param directoryStorageKey - Storage key of the directory (used as prefix match)
 * @param excludeId - Optional file ID to exclude from results (e.g., the directory itself)
 * @returns Array of file records with id and storage_key
 * @throws Error if database operation fails
 */
export async function getFilesInDirectory(
  directoryStorageKey: string,
  excludeId?: string,
): Promise<FileRecord[]> {
  // Sanitize input by escaping special LIKE wildcard characters
  const escapedKey = escapeLikePattern(directoryStorageKey);
  const escapedPattern = `${escapedKey}%`;

  // Build select query
  let query = supabase.from("files").select("id, storage_key").like("storage_key", escapedPattern);

  if (excludeId) {
    query = query.neq("id", excludeId);
  }

  const { data: childFiles, error: selectError } = await query;

  if (selectError) {
    throw new Error(`Failed to find files in directory: ${selectError.message}`);
  }

  return childFiles || [];
}
