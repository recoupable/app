// Limits for safe serialization
const MAX_JSON_LENGTH = 500;
const MAX_JSON_DEPTH = 3;

/**
 * Format field values with appropriate type handling
 *
 * @param value
 */
export function formatFieldValue(value: unknown): string | null {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value === "string") {
    return value.trim() || null;
  }

  if (typeof value === "number") {
    // Format large numbers with commas
    return value.toLocaleString();
  }

  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  if (Array.isArray(value)) {
    return value.length > 0 ? value.join(", ") : null;
  }

  if (typeof value === "object") {
    return safeStringifyObject(value);
  }

  return String(value);
}

// Safe JSON serialization with depth and length limits
/**
 *
 * @param obj
 */
function safeStringifyObject(obj: object): string {
  try {
    // Recursively walk object with per-branch depth tracking
    const limitDepth = (value: unknown, currentDepth: number): unknown => {
      if (currentDepth > MAX_JSON_DEPTH) {
        return "[Max depth]";
      }

      if (value === null || typeof value !== "object") {
        return value;
      }

      if (Array.isArray(value)) {
        return value.map(item => limitDepth(item, currentDepth + 1));
      }

      // Plain object - recurse into each property
      const limited: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(value)) {
        limited[key] = limitDepth(val, currentDepth + 1);
      }
      return limited;
    };

    const depthLimited = limitDepth(obj, 0);
    const result = JSON.stringify(depthLimited, null, 2);

    if (result.length > MAX_JSON_LENGTH) {
      return result.slice(0, MAX_JSON_LENGTH) + "...";
    }

    return result;
  } catch {
    // Handle circular references or stringify failures
    return "[Object (truncated)]";
  }
}
