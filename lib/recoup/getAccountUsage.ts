import { getClientApiBaseUrl } from "@/lib/api/getClientApiBaseUrl";
import type { UsageSort } from "@/lib/usage/usageSort";

export interface UsageEvent {
  id: string;
  created_at: string;
  source: string;
  agent_type: string | null;
  provider: string | null;
  model_id: string | null;
  input_tokens: number;
  cached_input_tokens: number;
  output_tokens: number;
  tool_call_count: number;
  /** Micro-dollars. Display `usd`; never print this integer. */
  credits_deducted: number;
  usd: string;
}

export interface AccountUsagePage {
  account_id: string;
  period: { from: string; to: string };
  total_credits_deducted: number;
  total_usd: string;
  events: UsageEvent[];
  next_cursor: string | null;
}

/**
 * GET /api/accounts/{id}/usage on the Recoup API (Privy bearer): the charges
 * behind the balance, newest first. The thrown error carries the HTTP status
 * so a 403 can render as a no-access state rather than a failure.
 */
async function getAccountUsage(
  accountId: string,
  accessToken: string,
  { limit, cursor, sort }: { limit: number; cursor?: string; sort?: UsageSort },
): Promise<AccountUsagePage> {
  const params = new URLSearchParams({ limit: String(limit) });
  if (sort) params.set("sort", sort);
  if (cursor) params.set("cursor", cursor);

  const response = await fetch(
    `${getClientApiBaseUrl()}/api/accounts/${accountId}/usage?${params}`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    },
  );

  if (!response.ok) {
    throw Object.assign(
      new Error(`Failed to fetch usage: ${response.status}`),
      {
        status: response.status,
      },
    );
  }

  return response.json();
}

export default getAccountUsage;
