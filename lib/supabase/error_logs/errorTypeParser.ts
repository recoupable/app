/**
 * extractToolNameFromError
 * Extracts error type/cause for categorization (tool_name column represents error type)
 * Used by error logging to populate the tool_name column for better analytics.
 *
 * @param errorMessage - The error message string
 * @param stackTrace - The stack trace string
 * @param errorType - The error type string (e.g., 'TypeError', 'AI_RetryError')
 * @returns string | null - The parsed tool name or error type
 */
export function extractToolNameFromError(
  errorMessage: string,
  stackTrace: string,
  errorType: string,
): string | null {
  // Rate limit errors
  if (
    errorType === "AI_RetryError" &&
    (errorMessage.includes("rate limit") ||
      errorMessage.includes("Rate limit") ||
      errorMessage.includes("input tokens per minute"))
  ) {
    return "Rate Limit";
  }

  // Object serialization errors
  if (errorMessage.includes("[object Object]") || errorMessage.includes("object Object")) {
    return "ObjectObject";
  }

  // Tool execution errors - extract actual tool name
  const toolExecutionMatch = errorMessage.match(/Error executing tool\s+([a-zA-Z_]+)/i);
  if (toolExecutionMatch) return toolExecutionMatch[1];

  // Check for specific tool patterns in error messages or stack traces
  const toolPatterns = [
    { pattern: /get_spotify_artist_top_tracks/, name: "get_spotify_artist_top_tracks" },
    { pattern: /search_web/, name: "search_web" },
    { pattern: /searchTwitter/, name: "searchTwitter" },
    { pattern: /contactTeam/, name: "contactTeam" },
    { pattern: /createArtist/, name: "createArtist" },
    { pattern: /sendEmail/, name: "sendEmail" },
    // Add more as needed
  ];

  for (const { pattern, name } of toolPatterns) {
    if (pattern.test(errorMessage) || pattern.test(stackTrace)) {
      return name;
    }
  }

  // Stack trace patterns for tool detection
  const stackToolPatterns = [
    /\/tools\/([^\/\s]+)/, // /tools/toolName
    /Tool\.([^\.\s]+)/, // Tool.toolName
    /tool[._]([^\.\s]+)/i, // tool.name or tool_name
  ];

  for (const pattern of stackToolPatterns) {
    const match = stackTrace.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  // Generic error type mapping
  if (errorType === "TypeError") return "TypeError";
  if (errorType === "ReferenceError") return "ReferenceError";
  if (errorType === "SyntaxError") return "SyntaxError";

  return null;
}

/**
 * Example usage:
 *   extractToolNameFromError('Error executing tool get_spotify_artist_top_tracks: ...', '', 'AI_ToolExecutionError');
 *   // => 'get_spotify_artist_top_tracks'
 */
