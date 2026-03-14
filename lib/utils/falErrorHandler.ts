/**
 * Maps Fal API errors to user-friendly error messages
 * Centralizes error handling logic for consistent messaging across all Fal tools
 *
 * @param originalError
 */
export function mapFalError(originalError: string): string {
  const errorMessage = originalError.toLowerCase();

  if (errorMessage.includes("api key") || errorMessage.includes("credentials")) {
    return "Fal AI API key is missing or invalid. Please check your FAL_KEY environment variable.";
  }

  if (errorMessage.includes("content policy")) {
    return "Your prompt may violate content policy. Please try a different prompt.";
  }

  if (errorMessage.includes("rate limit")) {
    return "Rate limit exceeded. Please try again later.";
  }

  // Return original error if no specific mapping found
  return originalError;
}
