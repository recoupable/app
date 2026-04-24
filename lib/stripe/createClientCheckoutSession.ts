import { getClientApiBaseUrl } from "@/lib/api/getClientApiBaseUrl";

const createClientCheckoutSession = async (
  accountId: string,
  accessToken: string,
) => {
  try {
    const url = new URL(window.location.href);
    url.searchParams.set("subscription", "success");
    const successUrl = url.toString();
    const response = await fetch(
      `${getClientApiBaseUrl()}/api/subscriptions/sessions`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ accountId, successUrl }),
      },
    );

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
