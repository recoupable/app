import { getClientApiBaseUrl } from "@/lib/api/getClientApiBaseUrl";
import type { UpgradePlan } from "@/lib/upgrade/types";

/**
 * POST /api/subscriptions/sessions and open the Stripe Checkout page.
 * `plan` is sent only when chosen: the api's body schema is strict, so an
 * older api still accepts the default (Pro) call.
 */
const createClientCheckoutSession = async (
  accessToken: string,
  options: { plan?: UpgradePlan } = {},
) => {
  try {
    const response = await fetch(
      `${getClientApiBaseUrl()}/api/subscriptions/sessions`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          successUrl: window.location.href,
          ...(options.plan ? { plan: options.plan } : {}),
        }),
      },
    );

    if (!response.ok) {
      return { error: new Error(`HTTP ${response.status}`) };
    }

    const data: { url?: string } = await response.json();
    if (!data.url) {
      return { error: new Error("Checkout URL missing") };
    }

    window.open(data.url, "_blank", "noopener,noreferrer");
  } catch (error) {
    return { error };
  }
};

export default createClientCheckoutSession;
