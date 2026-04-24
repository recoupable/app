import { getClientApiBaseUrl } from "@/lib/api/getClientApiBaseUrl";

const createClientCheckoutSession = async (accountId: string, accessToken: string) => {
  try {
    const successUrl = new URL(window.location.href);
    successUrl.searchParams.set("subscription", "success");
    const response = await fetch(`${getClientApiBaseUrl()}/api/subscriptions/sessions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ accountId, successUrl: successUrl.toString() }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to create checkout session");
    }

    window.open(data.url, "_blank");
  } catch (error) {
    return { error };
  }
};

export default createClientCheckoutSession;
