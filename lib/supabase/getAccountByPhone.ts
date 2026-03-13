import supabase from "./serverClient";

type AccountResponse = {
  id: string;
  email: string | null;
};

/**
 * Retrieves an account by phone number
 *
 * @param phone - The phone number to search for
 * @returns The account data if found
 * @throws Error if phone number is not provided or if there's a database error
 */
export async function getAccountByPhone(phone: string): Promise<AccountResponse> {
  if (!phone) {
    throw new Error("Phone number is required");
  }

  // Find account ID from phone number
  const { data: phoneData, error: phoneError } = await supabase
    .from("account_phone_numbers")
    .select("account_id")
    .eq("phone_number", phone)
    .single();

  if (phoneError) {
    if (phoneError.code === "PGRST116") {
      throw new Error("No account found with this phone number");
    }
    throw new Error("Error querying phone number");
  }

  // Get account details with email
  const { data: accountData, error: accountError } = await supabase
    .from("accounts")
    .select("id, email:account_emails(email)")
    .eq("id", phoneData.account_id)
    .single();

  if (accountError) {
    throw new Error("Error fetching account details");
  }

  return {
    id: accountData.id,
    email: accountData.email?.[0]?.email || null,
  };
}
