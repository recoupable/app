import { getClientApiBaseUrl } from "@/lib/api/getClientApiBaseUrl";

const createClientCheckoutSession = async (accessToken: string) => {
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
          successUrl: `${window.location.href}`,
        }),
      },
    );

    const data = await response.json();

    if (!response.ok || !data.url) {
      throw new Error(data.error || "Failed to create checkout session");
    }

    window.open(data.url, "__blank");
  } catch (error) {
    return { error };
  }
};

export default createClientCheckoutSession;
