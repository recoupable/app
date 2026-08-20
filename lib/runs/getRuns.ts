import { getClientApiBaseUrl } from "@/lib/api/getClientApiBaseUrl";

export type ValuationRun = {
  id: string;
  kind: "valuation";
  state: "queued" | "measuring" | "claimed" | "failed";
  album_count: number;
  created_at: string;
  result: { catalog_id: string } | null;
};

export interface GetRunsResponse {
  status: string;
  runs: ValuationRun[];
}

/**
 * The caller's latest valuation run from `GET /api/runs` (chat#1973) — the
 * generic run-status resource behind in-flight valuation UI. States are
 * domain phases; ids are opaque.
 *
 * @param accessToken - Privy bearer for the signed-in account.
 */
export async function getRuns(accessToken: string): Promise<GetRunsResponse> {
  const res = await fetch(`${getClientApiBaseUrl()}/api/runs?kind=valuation&limit=1`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status}: ${detail}`.trim());
  }

  const body: GetRunsResponse & { error?: string } = await res.json();
  // A 2xx envelope can still carry status "error"; treating it as "no runs"
  // would hide a real failure and stop the status poll.
  if (body.status === "error") {
    throw new Error(body.error || "Failed to fetch runs");
  }
  return body;
}
