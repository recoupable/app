import supabase from "@/lib/supabase/serverClient";

/**
 * Create account info for a new artist
 *
 * @param account_id - ID of the artist account
 * @returns True if successful, false if failed
 */
export async function createAccountInfo(account_id: string) {
  try {
    const { error } = await supabase.from("account_info").insert({ account_id });

    if (error) {
      console.error("Error creating account info:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Unexpected error creating artist account info:", error);
    return false;
  }
}

export default createAccountInfo;
