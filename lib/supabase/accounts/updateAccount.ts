import supabase from "@/lib/supabase/serverClient";
import type { Tables } from "@/types/database.types";

const updateAccount = async (
  id: string,
  update: Partial<Tables<"accounts">>,
): Promise<Tables<"accounts"> | null> => {
  const { data } = await supabase.from("accounts").update(update).eq("id", id).select("*").single();
  return data || null;
};

export default updateAccount;
