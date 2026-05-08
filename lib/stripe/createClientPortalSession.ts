import { getClientApiBaseUrl } from "@/lib/api/getClientApiBaseUrl";

const createClientPortalSession = async (accessToken: string) => {
  try {
    const response = await fetch(
      `${getClientApiBaseUrl()}/api/subscriptions/portal`,
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
