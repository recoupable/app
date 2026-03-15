import supabase from "@/lib/supabase/serverClient";
import { SUPABASE_STORAGE_BUCKET } from "@/lib/consts";
import { uploadFileByKey } from "./uploadFileByKey";

/**
 * Copy a file from one storage key to another by downloading and re-uploading
 * Used for rename and move operations since Supabase has no native copy/move
 *
 * @param sourceKey - Original storage key
 * @param targetKey - New storage key
 * @param contentType - Optional MIME type for the target file
 * @throws Error if download or upload fails
 */
export async function copyFileByKey(
  sourceKey: string,
  targetKey: string,
  contentType?: string,
): Promise<void> {
  // Download file from source
  const { data: fileData, error: downloadError } = await supabase.storage
    .from(SUPABASE_STORAGE_BUCKET)
    .download(sourceKey);

  if (downloadError || !fileData) {
    throw new Error(
      `Failed to download file from ${sourceKey}: ${downloadError?.message || "No data returned"}`,
    );
  }

  // Upload to target location
  await uploadFileByKey(targetKey, fileData, {
    contentType: contentType || fileData.type || "application/octet-stream",
    upsert: false, // Don't overwrite - we check for conflicts before calling this
  });
}
