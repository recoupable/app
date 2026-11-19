const limits = { part: 256 * 1024, ready: 32 * 1024, text: 24 * 1024 } as const;

/** Count complete UTF-8 output; never truncate private context or projections. */
export function fitsRetainedFieldBudget(
  kind: keyof typeof limits,
  value: unknown,
) {
  try {
    const serialized = kind === "text" ? value : JSON.stringify(value);
    return (
      typeof serialized === "string" &&
      new TextEncoder().encode(serialized).byteLength <= limits[kind]
    );
  } catch {
    return false;
  }
}
