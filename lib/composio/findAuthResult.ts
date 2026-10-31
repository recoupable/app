import { ComposioResultEntry } from "./types";

/**
 * Preserve the established first redirect/active result before falling back to
 * a supplied unusable redirect, so it can receive connection-link feedback.
 */
export function findAuthResult(
  results: Record<string, ComposioResultEntry> | undefined,
): ComposioResultEntry | null {
  if (!results) return null;

  const entries = Object.values(results);
  return (
    entries.find(
      (r) => r.redirect_url || r.status?.toLowerCase() === "active",
    ) ??
    entries.find((r) =>
      Object.prototype.hasOwnProperty.call(r, "redirect_url"),
    ) ??
    null
  );
}
