import supabase from "@/lib/supabase/serverClient";
import type { Tables } from "@/types/database.types";

const insertAccountArtistId = async (
  record: Partial<Tables<"account_artist_ids">>,
): Promise<Tables<"account_artist_ids"> | null> => {
  const { data } = await supabase.from("account_artist_ids").insert(record).select("*").single();
  return data || null;
};

export default insertAccountArtistId;
