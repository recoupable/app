import { ComposioResultEntry } from "./types";

/**
 * Find the auth result entry that has redirect_url or active status.
 * Returns null if no valid auth result is found.
 *
 * @param results
 */
export function findAuthResult(
  results: Record<string, ComposioResultEntry> | undefined,
): ComposioResultEntry | null {
  if (!results) return null;

  const entries = Object.values(results);
  return entries.find(r => r.redirect_url || r.status?.toLowerCase() === "active") || null;
}
