import supabase from "@/lib/supabase/serverClient";
import type { Tables } from "@/types/database.types";

const insertAccountEmail = async (
  accountId: string,
  email: string,
): Promise<Tables<"account_emails"> | null> => {
  const { data } = await supabase
    .from("account_emails")
    .insert({
      account_id: accountId,
      email,
    })
    .select("*")
    .single();

  return data || null;
};

export default insertAccountEmail;
