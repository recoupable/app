/**
 * Checks if a token is expired or about to expire (within safety buffer)
 *
 * @param expiresAt - Token expiration timestamp (ISO string)
 * @param safetyBufferMs - Safety buffer in milliseconds (default: 60000 = 1 minute)
 * @returns True if token is expired or about to expire
 */
export function isTokenExpired(
  expiresAt: string,
  safetyBufferMs: number = 60000
): boolean {
  const now = Date.now();
  const expirationTime = new Date(expiresAt).getTime();
  return now > expirationTime - safetyBufferMs;
}
