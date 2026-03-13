import supabase from "@/lib/supabase/serverClient";

type FilePermission = {
  id: string;
  owner_account_id: string;
  artist_account_id: string;
};

/**
 * Get file metadata by storage key for permission validation
 *
 * @param storageKey
 */
export async function getFileByStorageKey(storageKey: string): Promise<FilePermission | null> {
  const { data, error } = await supabase
    .from("files")
    .select("id, owner_account_id, artist_account_id")
    .eq("storage_key", storageKey)
    .single();

  if (error || !data) {
    return null;
  }

  return data;
}
