/**
 * Resolve the viewer's local IANA timezone (e.g. "America/Los_Angeles").
 *
 * Falls back to "UTC" when the runtime cannot resolve a zone (older engines,
 * locked-down environments) so callers always get a valid IANA string.
 */
export function getLocalTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}
