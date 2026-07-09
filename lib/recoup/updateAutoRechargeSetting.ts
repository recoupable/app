import { getClientApiBaseUrl } from "@/lib/api/getClientApiBaseUrl";
import type { AutoRechargeSetting } from "@/lib/recoup/getAutoRechargeSetting";

/**
 * PATCH /api/accounts/{id}/auto-recharge on the Recoup API (requires Privy
 * bearer). Disabling never removes the saved card — manual checkout top-ups
 * keep working and re-enabling requires no card re-entry.
 */
async function updateAutoRechargeSetting(
  accountId: string,
  accessToken: string,
  enabled: boolean,
): Promise<AutoRechargeSetting> {
  const response = await fetch(
    `${getClientApiBaseUrl()}/api/accounts/${accountId}/auto-recharge`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ enabled }),
    },
  );

  if (!response.ok) {
    throw new Error(`Failed to update auto top-up setting: ${response.status}`);
  }

  return response.json();
}

export default updateAutoRechargeSetting;
