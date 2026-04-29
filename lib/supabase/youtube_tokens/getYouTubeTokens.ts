import supabase from "@/lib/supabase/serverClient";
import type { YouTubeTokensRow } from "@/types/youtube";

/**
 * Get YouTube tokens for a specific account
 * @param artist_account_id - The artist account ID to get tokens for
 * @returns YouTube tokens or null if not found
 */
const getYouTubeTokens = async (
  artist_account_id: string
): Promise<YouTubeTokensRow | null> => {
  try {
    const { data, error } = await supabase
      .from("youtube_tokens")
      .select("*")
      .eq("artist_account_id", artist_account_id)
      .single();

    if (error) {
      // Don't log error for "not found" cases as this is expected
      if (error.code !== "PGRST116") {
        console.error("Error fetching YouTube tokens:", error);
      }
      return null;
    }

    return data as YouTubeTokensRow;
  } catch (error) {
    console.error("Unexpected error fetching YouTube tokens:", error);
    return null;
  }
};

export default getYouTubeTokens; 