/**
 * Escape special characters for PostgREST filter values
 * Wraps value in double quotes if it contains reserved characters (comma, period, colon, parentheses)
 *
 * @param value
 */
export function escapePostgrestValue(value: string): string {
  // PostgREST reserved characters that need escaping
  const needsEscaping = /[,.:()]/;

  if (needsEscaping.test(value)) {
    // Escape any existing double quotes, then wrap in quotes
    const escaped = value.replace(/"/g, '\\"');
    return `"${escaped}"`;
  }

  return value;
}
