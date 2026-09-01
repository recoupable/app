"use client";

import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { usePrivy } from "@privy-io/react-auth";
import { useUserProvider } from "@/providers/UserProvder";
import shouldTriggerCheckoutIntent from "@/lib/checkout/shouldTriggerCheckoutIntent";
import requestCheckoutSessionUrl from "@/lib/stripe/requestCheckoutSessionUrl";

const HANDLED_STORAGE_KEY = "recoup_checkout_intent_handled";

const wasHandled = () => {
  try {
    return window.sessionStorage.getItem(HANDLED_STORAGE_KEY) === "true";
  } catch {
    return false;
  }
};

const markHandled = () => {
  try {
    window.sessionStorage.setItem(HANDLED_STORAGE_KEY, "true");
  } catch {
    // Storage unavailable; the ref guard still prevents double-firing.
  }
};

/**
 * Carries a `?intent=pro-trial` landing into the Stripe Pro trial checkout.
 * Signed-in visitors go straight to checkout in the same tab; signed-out
 * visitors get the Privy login modal and continue automatically after auth.
 */
const useCheckoutIntent = () => {
  const searchParams = useSearchParams();
  const intent = searchParams.get("intent");
  const { ready, authenticated, login, getAccessToken } = usePrivy();
  const { userData } = useUserProvider();
  const hasAccount = Boolean(userData?.account_id);
  const hasPromptedLogin = useRef(false);
  const hasStartedCheckout = useRef(false);

  useEffect(() => {
    const action = shouldTriggerCheckoutIntent({
      intent,
      ready,
      authenticated,
      hasAccount,
      alreadyTriggered: hasStartedCheckout.current || wasHandled(),
    });

    if (action === "login") {
      if (hasPromptedLogin.current) return;
      hasPromptedLogin.current = true;
      login();
      return;
    }

    if (action !== "checkout") return;
    hasStartedCheckout.current = true;
    markHandled();

    const startCheckout = async () => {
      const accessToken = await getAccessToken();
      if (!accessToken) return;
      const url = await requestCheckoutSessionUrl(accessToken);
      if (!url) return;
      window.location.href = url;
    };
    void startCheckout();
  }, [intent, ready, authenticated, hasAccount, login, getAccessToken]);
};

export default useCheckoutIntent;
