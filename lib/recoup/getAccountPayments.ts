import { getClientApiBaseUrl } from "@/lib/api/getClientApiBaseUrl";

export interface AccountPayment {
  id: string;
  createdAt: string;
  description: string;
  amountCents: number;
  currency: string;
  status: "draft" | "open" | "paid" | "uncollectible" | "void";
  url: string | null;
}

export interface AccountPaymentsPage {
  account_id: string;
  payments: AccountPayment[];
  hasMore: boolean;
}

/** GET /api/accounts/{id}/payments: invoices newest first, one page per call. */
async function getAccountPayments(
  accountId: string,
  accessToken: string,
  { limit, startingAfter }: { limit: number; startingAfter?: string },
): Promise<AccountPaymentsPage> {
  const params = new URLSearchParams({ limit: String(limit) });
  if (startingAfter) params.set("startingAfter", startingAfter);
  const response = await fetch(
    `${getClientApiBaseUrl()}/api/accounts/${accountId}/payments?${params}`,
    { headers: { Authorization: `Bearer ${accessToken}` } },
  );
  if (!response.ok) {
    throw Object.assign(
      new Error(`Failed to fetch payments: ${response.status}`),
      { status: response.status },
    );
  }
  return response.json();
}

export default getAccountPayments;
