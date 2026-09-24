import { getClientApiBaseUrl } from "@/lib/api/getClientApiBaseUrl";

/**
 * Creates a Stripe checkout session and returns its URL for same-tab
 * navigation. The success URL drops the query string so a returning
 * visitor does not re-enter the intent flow.
 */
const requestCheckoutSessionUrl = async (
  accessToken: string,
): Promise<string | null> => {
  try {
    const successUrl = `${window.location.origin}${window.location.pathname}`;
    const response = await fetch(
      `${getClientApiBaseUrl()}/api/subscriptions/sessions`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ successUrl }),
      },
    );

    if (!response.ok) return null;

    const data: { url?: string } = await response.json();
    return data.url ?? null;
  } catch {
    return null;
  }
};

export default requestCheckoutSessionUrl;
