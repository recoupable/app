import supabase from "@/lib/supabase/serverClient";

/**
 * Delete YouTube tokens for a specific account
 *
 * @param artist_account_id - The artist account ID to delete tokens for
 * @returns boolean indicating success
 */
const deleteYouTubeTokens = async (artist_account_id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from("youtube_tokens")
      .delete()
      .eq("artist_account_id", artist_account_id);

    if (error) {
      console.error("Error deleting YouTube tokens:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Unexpected error deleting YouTube tokens:", error);
    return false;
  }
};

export default deleteYouTubeTokens;
