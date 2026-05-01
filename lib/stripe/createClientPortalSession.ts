import { getClientApiBaseUrl } from "@/lib/api/getClientApiBaseUrl";

const createClientPortalSession = async (accessToken: string) => {
  try {
    const response = await fetch(
      `${getClientApiBaseUrl()}/api/subscriptions/portal-sessions`,
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

    const data = await response.json();

    if (!response.ok || !data.url) {
      throw new Error(data.error || "Failed to create portal session");
    }

    window.open(data.url, "_blank");
  } catch (error) {
    console.error("Error creating portal session:", error);
    return { error };
  }
};

export default createClientPortalSession;
