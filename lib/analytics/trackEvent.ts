import { track } from "@vercel/analytics";

type EventProps = Parameters<typeof track>[1];

/**
 * Single door for custom Vercel Web Analytics events (chat#1902 C5).
 * Never include PII (emails, names, wallet addresses) in props.
 * Swallows analytics failures so tracking can never break product flows.
 */
const trackEvent = (name: string, props?: EventProps): void => {
  try {
    track(name, props);
  } catch {
    // Analytics must never break the product.
  }
};

export default trackEvent;
