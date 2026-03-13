import supabase from "@/lib/supabase/serverClient";
import { SUPABASE_STORAGE_BUCKET } from "@/lib/consts";

/**
 * Delete one or more files from Supabase storage by their storage keys
 *
 * @param keys - Single storage key or array of storage keys to delete
 * @throws Error if deletion fails
 */
export async function deleteFileByKey(keys: string | string[]): Promise<void> {
  const keysArray = Array.isArray(keys) ? keys : [keys];

  const { error } = await supabase.storage.from(SUPABASE_STORAGE_BUCKET).remove(keysArray);

  if (error) {
    throw new Error(`Failed to delete file(s) from storage: ${error.message}`);
  }
}
