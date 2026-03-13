import getArtistById from "@/lib/supabase/artist/getArtistById";
import deleteAccountArtistId from "@/lib/supabase/account_artist_ids/deleteAccountArtistId";
import getAccountArtistIds from "@/lib/supabase/account_artist_ids/getAccountArtistIds";
import deleteAccountById from "@/lib/supabase/accounts/deleteAccountById";

/**
 * Delete an artist association from an account
 * If no other accounts have this artist, also delete the artist account and related data
 *
 * @param artistAccountId - The ID of the artist account to delete
 * @param ownerAccountId - The ID of the owner account
 * @returns Object with success status, message, and artist name if successful
 */
export async function deleteArtistFromAccount(artistAccountId: string, ownerAccountId: string) {
  try {
    // First get the artist data using getArtistById utility
    const artistData = await getArtistById(artistAccountId);

    // Save artist name for the response
    const artistName = artistData?.name || "Unknown artist";

    // Delete the account_artist_ids record using utility
    const deleteResult = await deleteAccountArtistId(artistAccountId, ownerAccountId);

    if (!deleteResult.success) {
      return {
        success: false,
        message: "Failed to delete artist link",
      };
    }

    // If no rows were deleted, the link didn't exist
    if (!deleteResult.data || deleteResult.data.length === 0) {
      return {
        success: false,
        message: "Could not find artist link to delete",
      };
    }

    // Check if any other accounts still have this artist
    const artistLinks = await getAccountArtistIds({
      artistIds: [artistAccountId],
    });

    // If no other accounts have this artist, delete the artist account and related data
    if (artistLinks.length === 0) {
      // Delete the artist account using the generic account deletion utility
      const accountDeleteResult = await deleteAccountById(artistAccountId);

      if (!accountDeleteResult.success) {
        return {
          success: true,
          message: "Artist link removed, but failed to delete artist account",
          artistName,
        };
      }

      return {
        success: true,
        message: "Artist and all associated data deleted successfully",
        artistName,
      };
    }

    return {
      success: true,
      message: "Artist link removed successfully",
      artistName,
    };
  } catch (error) {
    console.error("Unexpected error in deleteArtistFromAccount:", error);
    return {
      success: false,
      message: "An unexpected error occurred",
    };
  }
}

export default deleteArtistFromAccount;
