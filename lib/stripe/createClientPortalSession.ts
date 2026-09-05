import { getClientApiBaseUrl } from "@/lib/api/getClientApiBaseUrl";

/**
 * Opens the Stripe billing portal for an account via
 * POST /api/accounts/{accountId}/portal. The account may be the caller's own
 * or an organization they belong to.
 */
const createClientPortalSession = async (
  accessToken: string,
  accountId: string,
) => {
  try {
    const response = await fetch(
      `${getClientApiBaseUrl()}/api/accounts/${accountId}/portal`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          returnUrl: window.location.href,
        }),
      },
    );

    if (!response.ok) {
      return { error: new Error(`HTTP ${response.status}`) };
    }

    const data: { url?: string } = await response.json();
    if (!data.url) {
      return { error: new Error("Portal URL missing") };
    }

    window.open(data.url, "_blank", "noopener,noreferrer");
  } catch (error) {
    return { error };
  }
};

export default createClientPortalSession;
