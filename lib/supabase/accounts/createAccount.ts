import supabase from "@/lib/supabase/serverClient";
import type { Tables } from "@/types/database.types";

/** Account row from database */
export type AccountRow = Tables<"accounts">;

/**
 * Create a new account in the database
 *
 * @param name - Name of the account to create
 * @returns Created account data or null if creation failed
 */
export async function createAccount(name: string): Promise<AccountRow | null> {
  try {
    const { data, error } = await supabase.from("accounts").insert({ name }).select("*").single();

    if (error) {
      console.error("Error creating account:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Unexpected error creating account:", error);
    return null;
  }
}

export default createAccount;
