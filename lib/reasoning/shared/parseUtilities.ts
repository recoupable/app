/**
 * Shared Parsing Utilities
 *
 * Common utilities for parsing reasoning content to eliminate code duplication.
 * Single responsibility: Shared parsing logic and utilities.
 */

export interface ParsedStep {
  label: string;
  description?: string;
  content: string;
}

/**
 * Create a step from a regex match and accumulate content
 *
 * @param label
 * @param initialContent
 * @param lines
 * @param startIndex
 */
export function createStepFromMatch(
  label: string,
  initialContent: string,
  lines: string[],
  startIndex: number,
): ParsedStep {
  let content = initialContent;

  // Accumulate content from subsequent lines until next match or end
  for (let i = startIndex + 1; i < lines.length; i++) {
    const line = lines[i];

    // Stop if we hit another match pattern (this would be handled by the specific extractor)
    if (isNewStepIndicator(line)) {
      break;
    }

    if (line.trim()) {
      content += "\n" + line;
    }
  }

  return {
    label,
    content: content.trim(),
  };
}

/**
 * Check if a line indicates a new step (used to stop content accumulation)
 *
 * @param line
 */
function isNewStepIndicator(line: string): boolean {
  // Check for common step indicators
  return (
    /^#{1,6}\s/.test(line) || // Headers
    /^\d+\.\s/.test(line) || // Numbered lists
    /^[-•*]\s/.test(line) || // Bullet points
    /^\*\*(.+?)\*\*:?\s*/.test(line) // Bold text
  );
}

/**
 * Truncate text to a reasonable label length
 *
 * @param text
 * @param maxLength
 */
export function truncateLabel(text: string, maxLength: number = 100): string {
  if (text.length <= maxLength) {
    return text;
  }

  // Try to break at sentence boundary
  const firstSentence = text.split(".")[0];
  if (firstSentence.length <= maxLength) {
    return firstSentence;
  }

  // Fallback to character limit
  return text.substring(0, maxLength - 3) + "...";
}

/**
 * Strip markdown formatting from text
 *
 * @param text
 */
export function stripMarkdownFormatting(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, "$1") // Remove bold **text**
    .replace(/\*(.*?)\*/g, "$1") // Remove italic *text*
    .replace(/`(.*?)`/g, "$1") // Remove code `text`
    .replace(/#{1,6}\s*/g, "") // Remove headers # ## ###
    .trim();
}

/**
 * Remove first line from content to avoid header duplication
 *
 * @param content
 */
export function removeFirstLine(content: string): string {
  const lines = content.split("\n");
  if (lines.length <= 1) return "";

  return lines.slice(1).join("\n").trim();
}
