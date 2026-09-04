import { getClientApiBaseUrl } from "@/lib/api/getClientApiBaseUrl";

/**
 * POST /api/accounts/{id}/payment-method and open the Stripe setup checkout,
 * which saves a card without charging it.
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
    if (!response.ok) {
      return { error: new Error(`HTTP ${response.status}`) };
    }
    const data: { url?: string } = await response.json();
    if (!data.url) {
      return { error: new Error("Checkout URL missing") };
    }
    window.open(data.url, "_blank", "noopener,noreferrer");
    return {};
  } catch (error) {
    return { error };
  }
};

export default createClientPaymentMethodSession;
