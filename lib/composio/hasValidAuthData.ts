import { ComposioResultEntry } from "./types";

/**
 * Check if the result contains valid auth data.
 *
 * @param result
 */
export function hasValidAuthData(result: unknown): result is {
  data?: { results?: Record<string, ComposioResultEntry> };
} {
  if (!result || typeof result !== "object") return false;
  const r = result as { data?: { results?: unknown } };
  return r.data?.results !== undefined;
}
