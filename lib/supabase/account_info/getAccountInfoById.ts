import supabase from "@/lib/supabase/serverClient";
import type { Tables } from "@/types/database.types";

const getAccountInfoById = async (accountId: string): Promise<Tables<"account_info"> | null> => {
  const { data } = await supabase
    .from("account_info")
    .select("*")
    .eq("account_id", accountId)
    .single();
  return data || null;
};

export default getAccountInfoById;
