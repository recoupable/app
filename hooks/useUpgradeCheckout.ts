"use client";

import { usePrivy } from "@privy-io/react-auth";
import { toast } from "sonner";
import createClientCheckoutSession from "@/lib/stripe/createClientCheckoutSession";
import type { UpgradePlan } from "@/lib/upgrade/types";

/** Opens Stripe Checkout for the plan a prompt's button names; every failure becomes a toast. */
export function useUpgradeCheckout() {
  const { getAccessToken } = usePrivy();

  const startCheckout = async (plan: UpgradePlan) => {
    try {
      const accessToken = await getAccessToken();
      if (!accessToken) {
        toast.error("Please sign in to upgrade.");
        return;
      }
      const result = await createClientCheckoutSession(accessToken, { plan });
      if (result?.error) throw result.error;
    } catch {
      toast.error("Could not open checkout. Please try again.");
    }
  };

  return { startCheckout };
}
