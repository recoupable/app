import { track } from "@vercel/analytics";

/**
 * Sends a custom event to Vercel Web Analytics. Analytics must never break a
 * user action, so a missing script or a blocked beacon is swallowed.
 *
 * @param name - Event name as it appears in the Vercel dashboard.
 * @param properties - Flat, primitive-valued properties.
 */
export function trackEvent(
  name: string,
  properties: Record<string, string | number | boolean | null>,
): void {
  try {
    track(name, properties);
  } catch {
    // Analytics is best effort.
  }
}
