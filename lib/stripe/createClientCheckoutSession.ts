import { getClientApiBaseUrl } from "@/lib/api/getClientApiBaseUrl";

const createClientCheckoutSession = async (
  accessToken: string,
  successUrl: string,
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
        body: JSON.stringify({ successUrl }),
      },
    );

    const data = (await response.json()) as {
      id?: string;
      url?: string;
      error?: string;
    };

    if (!response.ok || typeof data.url !== "string") {
      throw new Error(data.error || "Failed to create checkout session");
    }

    window.open(data.url, "_blank", "noopener,noreferrer");
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return { error };
  }
};

export default createClientCheckoutSession;
