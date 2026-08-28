"use client";

import { useLogin } from "@privy-io/react-auth";
import trackEvent from "@/lib/analytics/trackEvent";

/**
 * Fires the `signup_completed` funnel event when a Privy login flow finishes.
 * Skips users who entered the app already authenticated (session restore).
 * No PII in props (chat#1902 C5).
 */
export function useTrackSignupCompleted() {
  useLogin({
    onComplete: ({ isNewUser, wasAlreadyAuthenticated, loginMethod }) => {
      if (wasAlreadyAuthenticated) return;
      trackEvent("signup_completed", {
        is_new_user: isNewUser,
        login_method: loginMethod,
      });
    },
  });
}

export default useTrackSignupCompleted;
