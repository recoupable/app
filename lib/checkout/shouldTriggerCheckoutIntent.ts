export const PRO_TRIAL_INTENT = "pro-trial";

export type CheckoutIntentAction = "checkout" | "login" | "none";

export interface CheckoutIntentState {
  intent: string | null;
  ready: boolean;
  authenticated: boolean;
  hasAccount: boolean;
  alreadyTriggered: boolean;
}

/**
 * Decides what the `?intent=pro-trial` landing flow should do next.
 * Pure so the ordering rules (unknown intent, Privy readiness, auth,
 * account hydration, double-fire guard) stay unit-testable.
 */
const shouldTriggerCheckoutIntent = (
  state: CheckoutIntentState,
): CheckoutIntentAction => {
  if (state.intent !== PRO_TRIAL_INTENT) return "none";
  if (state.alreadyTriggered) return "none";
  if (!state.ready) return "none";
  if (!state.authenticated) return "login";
  if (!state.hasAccount) return "none";
  return "checkout";
};

export default shouldTriggerCheckoutIntent;
