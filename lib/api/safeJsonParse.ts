/**
 * Parses an HTTP response body as JSON, returning `null` instead of
 * throwing on invalid input. Returns `unknown` so callers validate the
 * shape themselves (e.g. with a zod schema) rather than trusting an
 * unchecked cast.
 */
export function safeJsonParse(raw: string): unknown {
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
