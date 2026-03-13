import supabase from "@/lib/supabase/serverClient";
import type { YouTubeTokensRow, YouTubeTokensInsert } from "@/types/youtube";

/**
 * Insert or update YouTube tokens for an account
 * Uses upsert to handle both new tokens and token refreshes
 *
 * @param tokens - YouTube tokens data to insert/update
 * @returns Inserted/updated YouTube tokens or null if operation failed
 */
const insertYouTubeTokens = async (
  tokens: YouTubeTokensInsert,
): Promise<YouTubeTokensRow | null> => {
  try {
    const { data, error } = await supabase
      .from("youtube_tokens")
      .upsert(tokens, {
        onConflict: "artist_account_id",
        ignoreDuplicates: false,
      })
      .select("*")
      .single();

    if (error) {
      console.error("Error inserting/updating YouTube tokens:", error);
      return null;
    }

    return data as YouTubeTokensRow;
  } catch (error) {
    console.error("Unexpected error inserting/updating YouTube tokens:", error);
    return null;
  }
};

export default insertYouTubeTokens;
