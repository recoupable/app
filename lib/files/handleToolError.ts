/**
 * Standardized error handler for file management tools
 * Returns consistent error response structure
 *
 * @param error
 * @param context
 * @param itemName
 */
export function handleToolError(
  error: unknown,
  context: string,
  itemName?: string,
): {
  success: false;
  error: string;
  message: string;
} {
  const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";

  const message = itemName
    ? `Failed to ${context} '${itemName}': ${errorMessage}`
    : `Failed to ${context}: ${errorMessage}`;

  return {
    success: false,
    error: errorMessage,
    message,
  };
}
