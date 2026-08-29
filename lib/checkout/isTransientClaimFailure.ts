/**
 * Whether a failed claim is worth retrying on the next load: a network
 * error, a 5xx, or a missing token. A 4xx code (`already_claimed`,
 * `not_found`) is final and the session id is retired.
 */
export function isTransientClaimFailure(error: unknown): boolean {
  if (!(error instanceof Error)) return true;
  if (error.message === "no_token") return true;
  const status = /^HTTP (\d{3})$/.exec(error.message)?.[1];
  if (status) return Number(status) >= 500;
  return error instanceof TypeError;
}
