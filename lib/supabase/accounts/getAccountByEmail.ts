import supabase from "@/lib/supabase/serverClient";
import type { Tables } from "@/types/database.types";

const getAccountByEmail = async (email: string): Promise<Tables<"account_emails"> | null> => {
  const { data } = await supabase.from("account_emails").select("*").eq("email", email).single();
  return data || null;
};

export default getAccountByEmail;
