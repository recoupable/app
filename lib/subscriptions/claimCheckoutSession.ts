import { getClientApiBaseUrl } from "@/lib/api/getClientApiBaseUrl";

export interface ClaimCheckoutSessionResponse {
  status: "success";
  subscription_id: string;
  plan: "starter" | "pro";
}

/**
 * POST /api/subscriptions/claim: attaches the subscription bought in a
 * Stripe Checkout session to the signed-in account, for the case where the
 * billing email differs from the login email. Throws the api's error code
 * (`already_claimed`, `not_found`) so the caller can word the toast; a 2xx
 * that is not a success envelope is a failure too.
 */
export async function claimCheckoutSession(
  accessToken: string,
  sessionId: string,
): Promise<ClaimCheckoutSessionResponse> {
  const response = await fetch(`${getClientApiBaseUrl()}/api/subscriptions/claim`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ session_id: sessionId }),
  });
  const data = await response.json().catch(() => null);
  if (!response.ok || data?.status !== "success") {
    throw new Error(data?.error || `HTTP ${response.status}`);
  }
  return data as ClaimCheckoutSessionResponse;
}
