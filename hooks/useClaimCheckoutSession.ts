"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { usePrivy } from "@privy-io/react-auth";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getCheckoutSessionId } from "@/lib/checkout/getCheckoutSessionId";
import { getClaimToast } from "@/lib/checkout/getClaimToast";
import { isTransientClaimFailure } from "@/lib/checkout/isTransientClaimFailure";
import { stripCheckoutParams } from "@/lib/checkout/stripCheckoutParams";
import { claimCheckoutSession } from "@/lib/subscriptions/claimCheckoutSession";

const CLAIMED_KEY = "recoup_checkout_claimed";

/**
 * After a Stripe success redirect, links the bought subscription to the
 * signed-in account once (`POST /api/subscriptions/claim`), then removes the
 * redirect params. The session id is retired (sessionStorage) only on a
 * final answer, so a network blip, a 5xx, or a missing token leaves the URL
 * intact and the next load retries.
 */
export function useClaimCheckoutSession(): void {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { authenticated, getAccessToken } = usePrivy();
  const inFlight = useRef(false);

  const sessionId = getCheckoutSessionId(searchParams);

  useEffect(() => {
    if (!sessionId || !authenticated || inFlight.current) return;
    if (window.sessionStorage.getItem(CLAIMED_KEY) === sessionId) return;
    inFlight.current = true;

    const finish = () => {
      window.sessionStorage.setItem(CLAIMED_KEY, sessionId);
      // Only touch the URL if the customer is still on the redirect.
      if (window.location.search.includes(`session_id=${sessionId}`)) {
        router.replace(stripCheckoutParams(pathname, searchParams));
      }
    };

    const claim = async () => {
      try {
        const accessToken = await getAccessToken();
        if (!accessToken) throw new Error("no_token");
        const result = await claimCheckoutSession(accessToken, sessionId);
        toast.success(getClaimToast({ ok: true, plan: result.plan }).text);
        await queryClient.invalidateQueries({ queryKey: ["credits"], exact: false });
        await queryClient.invalidateQueries({ queryKey: ["proStatus"], exact: false });
        finish();
      } catch (error) {
        const code = error instanceof Error ? error.message : "unknown";
        toast.error(getClaimToast({ ok: false, code }).text);
        if (!isTransientClaimFailure(error)) finish();
      } finally {
        inFlight.current = false;
      }
    };
    void claim();
    // Runs once per session id; the redirect params are removed right after.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId, authenticated]);
}
