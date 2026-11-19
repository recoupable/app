/** Compare JSON objects without depending on storage property order; preserve array order. */
export function stableJson(value: unknown): string {
  return JSON.stringify(value, (_, nested) =>
    nested && typeof nested === "object" && !Array.isArray(nested)
      ? Object.fromEntries(
          Object.keys(nested)
            .sort()
            .map((key) => [key, nested[key]]),
        )
      : nested,
  );
}
