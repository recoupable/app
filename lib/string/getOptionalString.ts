/**
 * Coerce an unknown value into a non-empty, trimmed string — or
 * `undefined` if the value isn't a string or trims to empty.
 *
 * Used to pluck optional message fields out of parsed JSON whose shape
 * isn't fully trusted (e.g. error envelopes from cross-origin POSTs).
 */
export function getOptionalString(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}
