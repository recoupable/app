/**
 * Header Extraction Utility
 *
 * Extracts steps from markdown headers (# ## ###).
 * Single responsibility: Parse header-based reasoning structure.
 */

import { ParsedStep, createStepFromMatch } from "../shared/parseUtilities";

/**
 * Extract steps based on markdown headers (# ## ###)
 *
 * @param content
 */
export function extractHeaderSteps(content: string): ParsedStep[] {
  if (!content.trim()) return [];

  const lines = content.split("\n");
  const steps: ParsedStep[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const headerMatch = line.match(/^(#{1,6})\s*(.+)$/);

    if (headerMatch) {
      const label = headerMatch[2].trim();
      const step = createStepFromMatch(label, "", lines, i);
      steps.push(step);
    }
  }

  return steps;
}
