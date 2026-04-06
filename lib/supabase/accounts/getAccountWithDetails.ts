import supabase from "../serverClient";
import { Tables } from "@/types/database.types";
import type { Knowledge } from "@/types/Knowledge";

type Account = Tables<"accounts">;
type AccountInfo = Omit<Tables<"account_info">, "knowledges"> & {
  knowledges: Knowledge[] | null;
};
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
