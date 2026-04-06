import supabase from "../serverClient";
import { Tables } from "@/types/database.types";

type Account = Tables<"accounts">;
type AccountInfo = Tables<"account_info">;
type AccountEmail = Tables<"account_emails">;
type AccountWallet = Tables<"account_wallets">;

export type AccountWithDetails = AccountInfo &
  AccountEmail &
  AccountWallet &
  Account;

export const getAccountWithDetails = async (
  accountId: string
): Promise<AccountWithDetails> => {
  const { data: account } = await supabase
    .from("accounts")
    .select("*, account_info(*), account_emails(*), account_wallets(*)")
    .eq("id", accountId)
    .single();

  if (!account) {
    throw new Error("Account not found");
  }

  return {
    ...account.account_info[0],
    ...account.account_emails[0],
    ...account.account_wallets[0],
    ...account,
  };
};
