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
          successUrl: window.location.href,
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
