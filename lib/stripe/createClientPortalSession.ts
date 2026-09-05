import { getClientApiBaseUrl } from "@/lib/api/getClientApiBaseUrl";
import readApiError from "@/lib/billing/readApiError";

/**
 * Opens the Stripe billing portal for an account via
 * POST /api/accounts/{accountId}/portal. The account may be the caller's own
 * or an organization they belong to. Navigates this tab (a window opened
 * after the await is popup-blocked); returnUrl brings the user back.
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
      return { error: await readApiError(response) };
    }

    const data: { url?: string } = await response.json();
    if (!data.url) {
      return { error: new Error("Portal URL missing") };
    }

    window.location.assign(data.url);
  } catch (error) {
    return { error };
  }
};

export default createClientPortalSession;
