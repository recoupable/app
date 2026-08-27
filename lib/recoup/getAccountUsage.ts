import { getClientApiBaseUrl } from "@/lib/api/getClientApiBaseUrl";

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

export type UsageSeriesBucket = "hour" | "day" | "week" | "month";

export interface UsageSeriesPoint {
  start: string;
  /** Micro-dollars. Display `usd`; never print this integer. */
  credits_deducted: number;
  usd: string;
  events: number;
}

export interface AccountUsagePage {
  account_id: string;
  period: { from: string; to: string };
  total_credits_deducted: number;
  total_usd: string;
  events: UsageEvent[];
  next_cursor: string | null;
  /** Only on a first page (no cursor): spend per bucket across the period. */
  series_bucket?: UsageSeriesBucket;
  series?: UsageSeriesPoint[];
}

/**
 * GET /api/accounts/{id}/usage on the Recoup API (Privy bearer): the charges
 * behind the balance, newest first, for the `from`/`to` period (the api
 * defaults to the current UTC month when omitted). The thrown error carries the HTTP status
 * so a 403 can render as a no-access state rather than a failure.
 */
async function getAccountUsage(
  accountId: string,
  accessToken: string,
  {
    limit,
    cursor,
    from,
    to,
  }: { limit: number; cursor?: string; from?: string; to?: string },
): Promise<AccountUsagePage> {
  const params = new URLSearchParams({ limit: String(limit) });
  if (from) params.set("from", from);
  if (to) params.set("to", to);
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
