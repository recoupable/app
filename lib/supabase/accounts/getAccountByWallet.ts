import supabase from "@/lib/supabase/serverClient";

/**
 *
 * @param wallet
 */
export async function getAccountByWallet(wallet: string) {
  const { data: walletFound, error: walletError } = await supabase
    .from("account_wallets")
    .select("*")
    .eq("wallet", wallet)
    .single();

  if (walletError) {
    throw new Error("No account found with this wallet address");
  }

  const { data: account, error: accountError } = await supabase
    .from("accounts")
    .select("*, account_info(*), account_emails(*), account_wallets(*)")
    .eq("id", walletFound.account_id)
    .single();

  if (accountError) {
    throw new Error("Error fetching account details");
  }

  return account;
}
