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
