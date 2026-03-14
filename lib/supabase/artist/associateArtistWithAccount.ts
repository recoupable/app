import supabase from "@/lib/supabase/serverClient";

/**
 * Associate an artist with a user account
 *
 * @param account_id - ID of the user account
 * @param artist_id - ID of the artist account
 * @returns True if successful, false if failed
 */
export async function associateArtistWithAccount(account_id: string, artist_id: string) {
  try {
    const { error } = await supabase.from("account_artist_ids").insert({
      account_id,
      artist_id,
    });

    if (error) {
      console.error("Error associating artist with account:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Unexpected error associating artist with account:", error);
    return false;
  }
}

export default associateArtistWithAccount;
