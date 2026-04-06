const createClientCheckoutSession = async (accessToken: string) => {
  try {
    const response = await fetch(`/api/stripe/session/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        successUrl: `${window.location.href}`,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to create checkout session");
    }

    window.open(data.data.url, "__blank");
  } catch (error) {
    return { error };
  }
};

export default createClientCheckoutSession;
