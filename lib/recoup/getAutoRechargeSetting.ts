import { getClientApiBaseUrl } from "@/lib/api/getClientApiBaseUrl";

export interface AutoRechargeSetting {
  account_id: string;
  enabled: boolean;
}

/**
 * GET /api/accounts/{id}/auto-recharge on the Recoup API (requires Privy
 * bearer). Reads whether automatic top-up is enabled — the setting lives on
 * the account's Stripe customer record and is read live by the api.
 */
async function getAutoRechargeSetting(
  accountId: string,
  accessToken: string,
): Promise<AutoRechargeSetting> {
  const response = await fetch(
    `${getClientApiBaseUrl()}/api/accounts/${accountId}/auto-recharge`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch auto top-up setting: ${response.status}`);
  }

  return response.json();
}

export default getAutoRechargeSetting;
