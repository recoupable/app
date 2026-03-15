import supabase from "@/lib/supabase/serverClient";
import type { Tables } from "@/types/database.types";

const updateAccountInfo = async (
  accountId: string,
  update: Partial<Tables<"account_info">>,
): Promise<Tables<"account_info"> | null> => {
  const { data } = await supabase
    .from("account_info")
    .update(update)
    .eq("account_id", accountId)
    .select("*")
    .single();
  return data || null;
};

export default updateAccountInfo;
