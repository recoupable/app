import { getClientApiBaseUrl } from "@/lib/api/getClientApiBaseUrl";
import { Tables } from "@/types/database.types";

export type AccountEmail = Tables<"account_emails">;

interface FetchAccountEmailsParams {
  accessToken: string;
  accountIds: string[];
}

/**
 * Fetches account email rows for the provided account IDs.
 */
export async function fetchAccountEmails({
  accessToken,
  accountIds,
}: FetchAccountEmailsParams): Promise<AccountEmail[]> {
  if (accountIds.length === 0) {
    return [];
  }

  const url = new URL(`${getClientApiBaseUrl()}/api/accounts/emails`);
  accountIds.forEach(accountId => {
    url.searchParams.append("account_id", accountId);
  });

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(error?.error || "Failed to fetch account emails");
  }

  return response.json();
}
