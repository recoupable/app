import type { Page } from "@browserbasehq/stagehand";
import { z } from "zod";

/**
 * Extract visible content and observe interactive elements
 *
 * @param page
 * @param instruction
 */
export async function extractPageData(page: Page, instruction?: string) {
  const { visibleContent } = await page.extract({
    instruction:
      "Extract all visible textual content from the page, including any visible counts, labels, captions, and metadata",
    schema: z.object({
      visibleContent: z.string().describe("All visible text content on the page"),
    }),
  });

  const observeResult = await page.observe({
    instruction: instruction || "Find all interactive elements and actions",
  });

  return { visibleContent, observeResult };
}
