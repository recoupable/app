/**
 * Whether a failed usage fetch was a 403, i.e. the account exists but the
 * signed-in user may not read it.
 */
const isForbiddenError = (error: unknown): boolean =>
  typeof error === "object" &&
  error !== null &&
  (error as { status?: number }).status === 403;

export default isForbiddenError;
