import supabase from "@/lib/supabase/serverClient";
import { Tables } from "@/types/database.types";

type FileRecord = Tables<"files">;

/**
 * Get all files for an artist account
 * Simple database query with no filtering logic
 *
 * @param artistAccountId - The artist's account ID
 * @returns Array of file records ordered by creation date (newest first)
 * @throws Error if database query fails
 */
export async function getFilesByArtistId(artistAccountId: string): Promise<FileRecord[]> {
  const { data, error } = await supabase
    .from("files")
    .select()
    .eq("artist_account_id", artistAccountId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to get files by artist: ${error.message}`);
  }

  return data || [];
}
