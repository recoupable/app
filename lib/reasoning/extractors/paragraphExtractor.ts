/**
 * Paragraph Extraction Utility
 *
 * Extracts steps from paragraph breaks when no clear structure exists.
 * Single responsibility: Parse unstructured reasoning into logical steps.
 */

import { ParsedStep, truncateLabel } from "../shared/parseUtilities";

/**
 * Extract steps based on paragraph breaks (fallback for unstructured content)
 *
 * @param content
 */
export function extractParagraphSteps(content: string): ParsedStep[] {
  if (!content.trim()) return [];

  // Try double newlines first (clear paragraph breaks)
  let paragraphs = content.split("\n\n").filter(p => p.trim());

  // If no clear paragraphs, split by substantial lines
  if (paragraphs.length < 2) {
    paragraphs = splitBySubstantialLines(content);
  }

  if (paragraphs.length === 0) return [];

  return paragraphs.map(paragraph => {
    const firstLine = paragraph.split("\n")[0].trim();
    const label = truncateLabel(firstLine);

    return {
      label,
      content: paragraph.trim(),
    };
  });
}

/**
 * Split content by lines that are substantial enough to be new thoughts
 *
 * @param content
 */
function splitBySubstantialLines(content: string): string[] {
  const lines = content.split("\n").filter(line => line.trim());
  const paragraphs: string[] = [];
  let currentParagraph = "";

  for (const line of lines) {
    if (line.trim().length > 50) {
      // Substantial line, likely a new thought
      if (currentParagraph) {
        paragraphs.push(currentParagraph.trim());
      }
      currentParagraph = line;
    } else if (currentParagraph) {
      currentParagraph += "\n" + line;
    }
  }

  if (currentParagraph) {
    paragraphs.push(currentParagraph.trim());
  }

  return paragraphs;
}
