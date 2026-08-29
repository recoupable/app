/**
 * The Stripe Checkout session id from a success redirect
 * (`?checkout=success&session_id={CHECKOUT_SESSION_ID}`), or null.
 */
export function getCheckoutSessionId(searchParams: URLSearchParams): string | null {
  if (searchParams.get("checkout") !== "success") return null;
  return searchParams.get("session_id") || null;
}
