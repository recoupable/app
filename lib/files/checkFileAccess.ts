import { checkAccountArtistAccess } from "@/lib/supabase/account_artist_ids/checkAccountArtistAccess";

/**
 * Check if a user has access to a file
 *
 * Access is granted if:
 * - User is the file owner, OR
 * - User has access to the artist that owns the file
 *
 * @param userId - The user's account ID
 * @param file - File record with owner_account_id and artist_account_id
 * @param file.owner_account_id
 * @param file.artist_account_id
 * @returns true if user has access, false otherwise
 */
export async function checkFileAccess(
  userId: string,
  file: { owner_account_id: string; artist_account_id: string },
): Promise<boolean> {
  // User owns the file directly
  if (file.owner_account_id === userId) {
    return true;
  }

  // Check if user has access to the artist that owns the file
  return await checkAccountArtistAccess(userId, file.artist_account_id);
}
