import { getClientApiBaseUrl } from "@/lib/api/getClientApiBaseUrl";
import type { UpgradePlan } from "@/lib/upgrade/types";

/**
 * POST /api/subscriptions/sessions and open the Stripe Checkout page.
 * Pro is the api's default, so `plan` goes on the wire only for Starter:
 * the body schema is strict and an api without Starter still accepts the
 * default call.
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
          ...(options.plan === "starter" ? { plan: options.plan } : {}),
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
