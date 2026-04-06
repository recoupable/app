const createClientPortalSession = async (accessToken: string) => {
  try {
    const response = await fetch(`/api/stripe/portal/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        returnUrl: window.location.href,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to create portal session");
    }

    window.open(data.data.url, "_blank");
  } catch (error) {
    console.error("Error creating portal session:", error);
    return { error };
  }
};

export default createClientPortalSession;
