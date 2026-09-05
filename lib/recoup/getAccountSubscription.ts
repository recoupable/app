import { getClientApiBaseUrl } from "@/lib/api/getClientApiBaseUrl";

export type SubscriptionStatus =
  | "active"
  | "trialing"
  | "canceled"
  | "past_due"
  | "none";

export interface AccountSubscription {
  isPro: boolean;
  status: SubscriptionStatus;
  plan: string | null;
  source: "account" | "organization" | null;
  name: string | null;
  amountCents: number | null;
  currency: string | null;
  interval: "day" | "week" | "month" | "year" | null;
  collectionMethod: "charge_automatically" | "send_invoice" | null;
  currentPeriodEnd: string | null;
}

/** GET /api/accounts/{id}/subscription: the plan that covers the account. */
async function getAccountSubscription(
  accountId: string,
  accessToken: string,
): Promise<AccountSubscription> {
  const response = await fetch(
    `${getClientApiBaseUrl()}/api/accounts/${accountId}/subscription`,
    { headers: { Authorization: `Bearer ${accessToken}` } },
  );
  if (!response.ok) {
    throw Object.assign(
      new Error(`Failed to fetch subscription: ${response.status}`),
      { status: response.status },
    );
  }
  return response.json();
}

export default getAccountSubscription;
