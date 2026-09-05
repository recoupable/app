import { getClientApiBaseUrl } from "@/lib/api/getClientApiBaseUrl";

export interface SavedCard {
  brand: string;
  last4: string;
  exp_month: number;
  exp_year: number;
  funding: string;
}

export interface AccountPaymentMethod {
  account_id: string;
  card: SavedCard | null;
}

/** GET /api/accounts/{id}/payment-method: the default card on file, or null. */
async function getAccountPaymentMethod(
  accountId: string,
  accessToken: string,
): Promise<AccountPaymentMethod> {
  const response = await fetch(
    `${getClientApiBaseUrl()}/api/accounts/${accountId}/payment-method`,
    { headers: { Authorization: `Bearer ${accessToken}` } },
  );
  if (!response.ok) {
    throw Object.assign(
      new Error(`Failed to fetch payment method: ${response.status}`),
      { status: response.status },
    );
  }
  return response.json();
}

export default getAccountPaymentMethod;
