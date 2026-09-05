import { getClientApiBaseUrl } from "@/lib/api/getClientApiBaseUrl";
import readApiError from "@/lib/billing/readApiError";

/**
 * POST /api/accounts/{id}/payment-method and send this tab to the Stripe setup
 * checkout, which saves a card without charging it. Same-tab on purpose: a
 * window opened after the await is popup-blocked, and successUrl brings the
 * user back here.
 */
const createClientPaymentMethodSession = async (
  accountId: string,
  accessToken: string,
): Promise<{ error?: unknown }> => {
  try {
    const response = await fetch(
      `${getClientApiBaseUrl()}/api/accounts/${accountId}/payment-method`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ successUrl: window.location.href }),
      },
    );
    if (!response.ok) return { error: await readApiError(response) };
    const data: { url?: string } = await response.json();
    if (!data.url) return { error: new Error("Checkout URL missing") };
    window.location.assign(data.url);
    return {};
  } catch (error) {
    return { error };
  }
};

export default createClientPaymentMethodSession;
