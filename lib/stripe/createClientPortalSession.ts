import { getClientApiBaseUrl } from "@/lib/api/getClientApiBaseUrl";

/**
 * Creates a Stripe billing portal session via POST /api/subscriptions/portal.
 * Account is implied by the Bearer token (see API docs).
 */
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

    const data: unknown = await response.json();

    if (!response.ok) {
      const message =
        typeof data === "object" &&
        data !== null &&
        "error" in data &&
        typeof (data as { error: unknown }).error === "string"
          ? (data as { error: string }).error
          : "Failed to create portal session";
      throw new Error(message);
    }

    if (
      typeof data !== "object" ||
      data === null ||
      !("url" in data) ||
      typeof (data as { url: unknown }).url !== "string"
    ) {
      throw new Error("Invalid portal response");
    }

    window.open((data as { url: string }).url, "_blank");
  } catch (error) {
    console.error("Error creating portal session:", error);
    return { error };
  }
};

export default createClientPortalSession;
