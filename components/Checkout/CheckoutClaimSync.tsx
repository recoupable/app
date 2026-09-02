"use client";

import { useClaimCheckoutSession } from "@/hooks/useClaimCheckoutSession";

/** Mounts the post-checkout claim once for the whole app; renders nothing. */
export default function CheckoutClaimSync() {
  useClaimCheckoutSession();
  return null;
}
