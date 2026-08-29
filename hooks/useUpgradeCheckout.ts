"use client";

import { usePrivy } from "@privy-io/react-auth";
import { toast } from "sonner";
import createClientCheckoutSession from "@/lib/stripe/createClientCheckoutSession";
import type { UpgradePlan } from "@/lib/upgrade/types";

/** Opens Stripe Checkout for the plan a prompt's button names. */
export function useUpgradeCheckout() {
  const { getAccessToken } = usePrivy();

  const startCheckout = async (plan: UpgradePlan) => {
    const accessToken = await getAccessToken();
    if (!accessToken) {
      toast.error("Please sign in to upgrade.");
      return;
    }
    const result = await createClientCheckoutSession(accessToken, { plan });
    if (result?.error) {
      toast.error("Could not open checkout. Please try again.");
    }
  };

  return { startCheckout };
}
