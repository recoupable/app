import { getClientApiBaseUrl } from "@/lib/api/getClientApiBaseUrl";

export interface AutoTopUpSettings {
  account_id: string;
  enabled: boolean;
  amountCents: number | null;
  thresholdCents: number | null;
  lastRunAt: string | null;
  lastError: string | null;
}

/** GET /api/accounts/{id}/auto-top-up: the opt-in refill settings. */
async function getAccountAutoTopUp(
  accountId: string,
  accessToken: string,
): Promise<AutoTopUpSettings> {
  const response = await fetch(
    `${getClientApiBaseUrl()}/api/accounts/${accountId}/auto-top-up`,
    { headers: { Authorization: `Bearer ${accessToken}` } },
  );
  if (!response.ok) {
    throw Object.assign(
      new Error(`Failed to fetch auto top-up: ${response.status}`),
      { status: response.status },
    );
  }
  return response.json();
}

export default getAccountAutoTopUp;
