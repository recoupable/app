/** Keep malformed or non-HTTPS tool data from becoming an authorization action. */
export function getHttpsRedirectUrl(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;

  try {
    const url = new URL(value);
    return url.protocol === "https:" ? url.href : undefined;
  } catch {
    return undefined;
  }
}
