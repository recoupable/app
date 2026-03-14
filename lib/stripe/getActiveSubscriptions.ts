import stripeClient from "./client";
import Stripe from "stripe";

export const getActiveSubscriptions = async (accountId: string) => {
  try {
    const subscriptions = await stripeClient.subscriptions.list({
      limit: 100,
      current_period_end: {
        gt: parseInt(Number(Date.now() / 1000).toFixed(0), 10),
      },
    });

    const activeSubscriptions = subscriptions?.data?.filter(
      (subscription: Stripe.Subscription) => subscription.metadata?.accountId === accountId,
    );

    return activeSubscriptions || [];
  } catch (error) {
    console.error("Error fetching subscriptions:", error);
    return [];
  }
};
