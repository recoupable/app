/**
 * Format camelCase or snake_case field names to readable labels
 *
 * @param fieldName
 */
export function formatFieldName(fieldName: string): string {
  return (
    fieldName
      // Handle camelCase: insert space before capitals
      .replace(/([A-Z])/g, " $1")
      // Handle snake_case: replace underscores with spaces
      .replace(/_/g, " ")
      // Capitalize first letter of each word
      .split(" ")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ")
      .trim()
  );
}
