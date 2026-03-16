import supabase from "@/lib/supabase/serverClient";
import { isValidUUID } from "@/utils/isValidUUID";

/**
 * Delete multiple file records from the database
 * Used after successfully deleting storage blobs to maintain data integrity
 *
 * @param fileIds - Array of file record UUIDs to delete
 * @throws Error if deletion fails or any fileId is invalid
 */
export async function deleteFileRecords(fileIds: string[]): Promise<void> {
  // Input validation
  if (!fileIds || fileIds.length === 0) {
    return; // Nothing to delete
  }

  // Validate all UUIDs
  for (const fileId of fileIds) {
    if (!fileId || typeof fileId !== "string" || fileId.trim().length === 0) {
      throw new Error("All file IDs must be non-empty strings");
    }

    if (!isValidUUID(fileId)) {
      throw new Error(`Invalid UUID format for file ID: ${fileId}`);
    }
  }

  // Perform batch delete
  const { error } = await supabase.from("files").delete().in("id", fileIds);

  if (error) {
    throw new Error(`Failed to delete file records: ${error.message}`);
  }
}
