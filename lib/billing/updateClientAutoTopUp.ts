import { getClientApiBaseUrl } from "@/lib/api/getClientApiBaseUrl";
import type { AutoTopUpSettings } from "@/lib/recoup/getAccountAutoTopUp";

export interface AutoTopUpInput {
  enabled: boolean;
  amountCents: number;
  thresholdCents: number;
}

/** PUT /api/accounts/{id}/auto-top-up; throws the api's message on a 4xx. */
async function updateClientAutoTopUp(
  accountId: string,
  accessToken: string,
  input: AutoTopUpInput,
): Promise<AutoTopUpSettings> {
  const response = await fetch(
    `${getClientApiBaseUrl()}/api/accounts/${accountId}/auto-top-up`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(input),
    },
  );
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error ?? `HTTP ${response.status}`);
  }
  return response.json();
}

export default updateClientAutoTopUp;
