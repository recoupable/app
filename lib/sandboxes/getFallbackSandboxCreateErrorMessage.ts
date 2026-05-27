/**
 * Status-derived fallback message for `POST /api/sandbox` failures
 * where recoup-api didn't return a structured `error` field. 403s
 * generally mean the user's GitHub install lost access (most common
 * cause: revoked GitHub App permission), so we steer them to reconnect.
 */
export function getFallbackSandboxCreateErrorMessage(status: number): string {
  if (status === 403) {
    return "Sandbox access denied. Please reconnect GitHub and try again.";
  }
  return "Failed to create sandbox. Please try again.";
}
