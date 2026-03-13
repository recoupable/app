import serverClient from "../serverClient";
import { Tables } from "@/types/database.types";

type AccountEmail = Tables<"account_emails">;

export const getAccountEmails = async (accountIds: string | string[]): Promise<AccountEmail[]> => {
  const ids = Array.isArray(accountIds) ? accountIds : [accountIds];
  if (ids.length === 0) return [];

  const { data, error } = await serverClient
    .from("account_emails")
    .select("*")
    .in("account_id", ids);

  if (error) {
    console.error("Error fetching account emails:", error);
    throw error;
  }

  return data || [];
};

export default getAccountEmails;
