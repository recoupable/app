import trackEvent from "@/lib/analytics/trackEvent";

export type SignupStartedSource =
  | "menu"
  | "modal_auto"
  | "signin_page"
  | "start_button";

/**
 * Fires the `signup_started` funnel event. Call immediately before every
 * programmatic Privy `login()` so each entry point is attributed by source.
 */
const trackSignupStarted = (source: SignupStartedSource): void => {
  trackEvent("signup_started", { source });
};

export default trackSignupStarted;
