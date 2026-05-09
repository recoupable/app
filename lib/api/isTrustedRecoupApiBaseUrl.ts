import { IS_PROD, NEW_API_BASE_URL } from "@/lib/consts";

function toApiUrl(apiBaseUrl: string): URL | null {
  const trimmed = apiBaseUrl.trim().replace(/\/+$/, "");
  if (!trimmed) return null;
  try {
    return new URL(`${trimmed}/`);
  } catch {
    return null;
  }
}

const TRUST_DEFAULT_ORIGIN = toApiUrl(NEW_API_BASE_URL)?.origin;

const TRUST_ALT_ORIGIN = toApiUrl(
  IS_PROD
    ? "https://test-recoup-api.vercel.app"
    : "https://api.recoupable.com",
)?.origin;

/**
 * True when the client API base (including sessionStorage overrides) may receive
 * a Privy Bearer token from the browser.
 */
export function isTrustedRecoupApiBaseUrl(apiBaseUrl: string): boolean {
  const url = toApiUrl(apiBaseUrl);
  if (!url) return false;

  if (
    (TRUST_DEFAULT_ORIGIN && url.origin === TRUST_DEFAULT_ORIGIN) ||
    (TRUST_ALT_ORIGIN && url.origin === TRUST_ALT_ORIGIN)
  ) {
    return true;
  }

  return (
    url.protocol === "http:" &&
    (url.hostname === "localhost" || url.hostname === "127.0.0.1")
  );
}
