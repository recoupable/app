/**
 * Human-friendly label for an IANA timezone, e.g.
 * "America/Los_Angeles" -> "America/Los Angeles (GMT-7)".
 *
 * The GMT offset is computed for "now", so it reflects the zone's current
 * DST state. Falls back to the raw zone name if the offset can't be resolved.
 */
export function formatTimezoneLabel(timezone: string): string {
  const readableName = timezone.replace(/_/g, " ");

  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      timeZoneName: "shortOffset",
    }).formatToParts(new Date());
    const offset = parts.find((p) => p.type === "timeZoneName")?.value;
    return offset ? `${readableName} (${offset})` : readableName;
  } catch {
    return readableName;
  }
}
