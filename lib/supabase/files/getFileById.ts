import supabase from "@/lib/supabase/serverClient";

/**
 * File record with permission and directory information
 * Used for access control and deletion operations
 */
export type FileWithPermissions = {
  id: string;
  owner_account_id: string;
  artist_account_id: string;
  is_directory: boolean;
  storage_key: string;
};

/**
 * Get a file record by ID with all fields needed for permission checks
 *
 * @param fileId - UUID of the file to retrieve
 * @returns File record with permission fields or null if not found
 * @throws Error if database operation fails (but not if file doesn't exist)
 */
export async function getFileById(fileId: string): Promise<FileWithPermissions | null> {
  const { data, error } = await supabase
    .from("files")
    .select("id, owner_account_id, artist_account_id, is_directory, storage_key")
    .eq("id", fileId)
    .single();

  if (error) {
    // Handle "not found" gracefully by returning null
    if (error.code === "PGRST116") {
      return null;
    }
    throw new Error(`Failed to fetch file: ${error.message}`);
  }

  return data;
}
