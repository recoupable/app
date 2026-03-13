import supabase from "@/lib/supabase/serverClient";

/**
 * Update the storage_key of a file record (used for move operations)
 *
 * @param fileId - UUID of the file record to update
 * @param newStorageKey - New storage key path
 * @throws Error if update fails
 */
export async function updateFileStorageKey(fileId: string, newStorageKey: string): Promise<void> {
  const { error } = await supabase
    .from("files")
    .update({
      storage_key: newStorageKey,
      updated_at: new Date().toISOString(),
    })
    .eq("id", fileId);

  if (error) {
    throw new Error(`Failed to update file storage key: ${error.message}`);
  }
}
