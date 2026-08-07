import { getClientApiBaseUrl } from "@/lib/api/getClientApiBaseUrl";

export interface AccountCredits {
  account_id: string;
  remaining_credits: number;
  total_credits: number;
  used_credits: number;
  is_pro: boolean;
  timestamp: string;
}

/**
 * GET /api/accounts/{id}/credits on the Recoup API (requires Privy bearer).
 * Credits logic (monthly reset, pro/enterprise tiers) lives in the api repo.
 */
async function getAccountCredits(
  accountId: string,
  accessToken: string,
): Promise<AccountCredits> {
  // react-query's `enabled` does not apply to `refetch()`, so callers can
  // reach here before the account resolves. Without this the id interpolates
  // as the string "undefined" and the api 400s (chat#1949 F4b).
  if (!accountId || accountId === "undefined") {
    throw new Error("Cannot load credits without a resolved account id");
  }

  const response = await fetch(
    `${getClientApiBaseUrl()}/api/accounts/${accountId}/credits`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch credits: ${response.status}`);
  }

  return response.json();
}

export default getAccountCredits;
