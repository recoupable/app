/**
 * Runtime type guard: Ensure value is a plain object (not array, null, or class instance)
 *
 * @param value
 */
export function isPlainObject(value: unknown): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    Object.getPrototypeOf(value) === Object.prototype
  );
}
