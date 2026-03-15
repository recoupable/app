/**
 * Convert observe results to human-readable action strings
 * Handles strings, objects with description/action properties, and fallback to JSON
 *
 * @param observeResult
 */
export function formatActionsToString(observeResult: unknown): string {
  // Normalize to array
  const actions = Array.isArray(observeResult) ? observeResult : [observeResult];

  // Convert each action to a human-readable string
  const actionStrings = actions
    .map(action => {
      if (typeof action === "string") {
        return action.trim();
      }
      if (action && typeof action === "object") {
        // Try to extract a descriptive property
        if ("description" in action && typeof action.description === "string") {
          return action.description.trim();
        }
        if ("action" in action && typeof action.action === "string") {
          return action.action.trim();
        }
        // Fallback to JSON.stringify for unknown objects
        try {
          return JSON.stringify(action);
        } catch {
          return "[Unknown action]";
        }
      }
      return "";
    })
    .filter(str => str.length > 0); // Remove empty strings

  return actionStrings.length > 0
    ? actionStrings.map(str => `- ${str}`).join("\n")
    : "No specific actions identified";
}
