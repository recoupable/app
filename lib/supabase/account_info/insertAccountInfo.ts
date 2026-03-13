import supabase from "@/lib/supabase/serverClient";
import type { Tables } from "@/types/database.types";

const insertAccountInfo = async (
  info: Partial<Tables<"account_info">>,
): Promise<Tables<"account_info"> | null> => {
  const { data } = await supabase.from("account_info").insert(info).select("*").single();
  return data || null;
};

export default insertAccountInfo;
