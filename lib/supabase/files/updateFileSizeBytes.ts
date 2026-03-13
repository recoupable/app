import supabase from "@/lib/supabase/serverClient";

/**
 * Update file size in bytes in the files table
 *
 * @param fileId
 * @param sizeBytes
 */
export async function updateFileSizeBytes(fileId: string, sizeBytes: number): Promise<void> {
  const { error } = await supabase.from("files").update({ size_bytes: sizeBytes }).eq("id", fileId);

  if (error) {
    throw new Error(`Failed to update file size: ${error.message}`);
  }
}
