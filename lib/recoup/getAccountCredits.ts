import { getClientApiBaseUrl } from "@/lib/api/getClientApiBaseUrl";

export interface AccountCredits {
  account_id: string;
  remaining_credits: number;
  total_credits: number;
  used_credits: number;
  is_pro: boolean;
  timestamp: string;
  /** Present once the api resolves plans (app#2044 row 3); absent before. */
  plan?: "free" | "starter" | "pro";
  /** Enabled tasks the plan allows; null is uncapped. */
  task_limit?: number | null;
  /** Shortest gap between two runs the plan allows. */
  min_cadence_minutes?: number;
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
