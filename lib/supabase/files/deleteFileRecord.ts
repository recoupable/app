import supabase from "@/lib/supabase/serverClient";
import { isValidUUID } from "@/utils/isValidUUID";

/**
 * Delete a file record from the database
 *
 * @param fileId - UUID of the file record to delete
 * @throws Error if deletion fails or fileId is invalid
 */
export async function deleteFileRecord(fileId: string): Promise<void> {
  // Input validation: check if fileId is a non-empty string and valid UUID
  if (!fileId || typeof fileId !== "string" || fileId.trim().length === 0) {
    throw new Error("File ID must be a non-empty string");
  }

  // Validate UUID v4 format using shared utility
  if (!isValidUUID(fileId)) {
    throw new Error(`Invalid UUID format for file ID: ${fileId}`);
  }

  // Perform delete and request deleted rows back
  const { data, error } = await supabase.from("files").delete().eq("id", fileId).select();

  // Check for supabase error
  if (error) {
    throw new Error(`Failed to delete file record: ${error.message}`);
  }

  // Verify that at least one row was deleted
  if (!data || data.length === 0) {
    throw new Error(`File record not found or not deleted: ${fileId}`);
  }
}
