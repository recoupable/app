import supabase from "@/lib/supabase/serverClient";

/**
 * Delete an association between an account and an artist
 *
 * @param artistId - The ID of the artist
 * @param accountId - The ID of the account
 * @returns Object with success status, deleted links data, and any error
 */
export async function deleteAccountArtistId(artistId: string, accountId: string) {
  try {
    const { data, error } = await supabase
      .from("account_artist_ids")
      .delete()
      .eq("artist_id", artistId)
      .eq("account_id", accountId)
      .select();

    if (error) {
      console.error("Error deleting account artist ID:", error);
      return {
        success: false,
        error,
      };
    }

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error("Unexpected error in deleteAccountArtistId:", error);
    return {
      success: false,
      error,
    };
  }
}

export default deleteAccountArtistId;
