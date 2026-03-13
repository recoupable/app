/**
 * Reasoning Title Extraction Utility
 *
 * Extracts the first line or sentence as the title for reasoning content,
 * with intelligent markdown stripping and length handling.
 * Single responsibility: Extract meaningful titles from reasoning text.
 */

/**
 * Extract the first line of reasoning content as a clean title
 *
 * @param content - The reasoning content to extract title from
 * @returns Clean, formatted title string
 */
export function extractReasoningTitle(content?: string): string {
  if (!content) return "Reasoning";

  // Get the first non-empty line
  const lines = content.split("\n").filter(line => line.trim());
  if (lines.length > 0) {
    let firstLine = lines[0].trim();

    // Strip markdown formatting
    firstLine = firstLine
      .replace(/\*\*(.*?)\*\*/g, "$1") // Remove bold **text**
      .replace(/\*(.*?)\*/g, "$1") // Remove italic *text*
      .replace(/`(.*?)`/g, "$1") // Remove code `text`
      .replace(/#{1,6}\s*/g, "") // Remove headers # ## ###
      .trim();

    // If it's a short line (likely a title), use it as-is
    if (firstLine.length < 100) {
      return firstLine;
    }
    // If it's a long line, extract the first sentence
    const firstSentence = firstLine.split(".")[0];
    return firstSentence.length < 100 ? firstSentence : firstSentence.substring(0, 97) + "...";
  }
  return "Reasoning";
}
