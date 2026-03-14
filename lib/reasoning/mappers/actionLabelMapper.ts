/**
 * Action Label Mapper
 *
 * Maps reasoning content to action-oriented labels like "Searching", "Analyzing".
 * Single responsibility: Convert content to Perplexity-style action verbs.
 */

/**
 * Extract action verb from content to create step labels
 *
 * @param content
 */
export function mapContentToActionLabel(content: string): string {
  const lowerContent = content.toLowerCase();

  // Map keywords to action labels
  const actionMap = [
    { keywords: ["search", "find", "look"], action: "Searching" },
    { keywords: ["analyz", "consider", "think"], action: "Analyzing" },
    { keywords: ["review", "check", "examine"], action: "Reviewing" },
    { keywords: ["plan", "design", "strategy"], action: "Planning" },
    { keywords: ["gather", "collect", "compile"], action: "Gathering" },
    { keywords: ["clarify", "confirm", "verify"], action: "Clarifying" },
    { keywords: ["propose", "suggest", "recommend"], action: "Proposing" },
    { keywords: ["assess", "evaluat", "determin"], action: "Assessing" },
  ];

  // Find first matching action
  for (const { keywords, action } of actionMap) {
    if (keywords.some(keyword => lowerContent.includes(keyword))) {
      return action;
    }
  }

  // Default action
  return "Processing";
}
