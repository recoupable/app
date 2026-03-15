import stripeClient from "./client";
import { getActiveSubscriptionDetails } from "./getActiveSubscriptionDetails";

const createBillingPortalSession = async (accountId: string, returnUrl: string) => {
  try {
    const activeSubscription = await getActiveSubscriptionDetails(accountId);

    if (!activeSubscription) {
      throw new Error("No active subscription found for this account");
    }

    const portalSession = await stripeClient.billingPortal.sessions.create({
      customer: activeSubscription.customer as string,
      return_url: returnUrl,
    });

    return portalSession;
  } catch (error) {
    console.error("Error creating billing portal session:", error);
    throw error;
  }
};

export default createBillingPortalSession;
