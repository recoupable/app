import { z } from "zod";
import { tool } from "ai";
import { withBrowser } from "@/lib/browser/withBrowser";
import { captureScreenshot } from "@/lib/browser/captureScreenshot";
import { detectPlatform } from "@/lib/browser/detectPlatform";
import { formatActionsToString } from "@/lib/browser/formatActionsToString";
import { performPageSetup } from "@/lib/browser/performPageSetup";
import { extractPageData } from "@/lib/browser/extractPageData";
import { buildResponseText } from "@/lib/browser/buildResponseText";

export interface BrowserObserveResult {
  success: boolean;
  message?: string;
  screenshotUrl?: string;
  sessionUrl?: string;
  platformName?: string;
  error?: string;
}

const browserObserve = tool({
  description: `View any website and return all visible text. Use when user mentions a website/URL/social platform and wants to see content. Example: "What's on instagram.com/artist" or "Show me fatbeats.com"`,
  inputSchema: z.object({
    url: z.string().url().describe("The URL of the webpage to observe"),
    instruction: z
      .string()
      .optional()
      .describe(
        "Optional instruction to guide the observation (e.g., 'find submit buttons', 'locate navigation menu')",
      ),
  }),
  execute: async ({ url, instruction }) => {
    try {
      return await withBrowser(async (page, liveViewUrl, sessionUrl) => {
        // 1. Setup: navigate, scroll, dismiss modals
        const modalDismissed = await performPageSetup(page, url);

        // 2. Extract: get page content and interactive elements
        const { visibleContent, observeResult } = await extractPageData(page, instruction);

        // 3. Capture: screenshot and metadata
        const screenshotUrl = await captureScreenshot(page, url);
        const actionsText = formatActionsToString(observeResult);
        const platformName = detectPlatform(url);

        // 4. Build: formatted response text
        const isRateLimited =
          visibleContent.includes("Take a quick pause") ||
          visibleContent.includes("more requests than usual");
        const responseText = buildResponseText(
          visibleContent,
          actionsText,
          modalDismissed,
          platformName,
          isRateLimited,
        );

        return {
          success: true,
          message: responseText,
          screenshotUrl,
          sessionUrl,
          platformName,
        };
      });
    } catch (error) {
      return {
        success: false,
        error: `Failed to observe page: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      };
    }
  },
});

export default browserObserve;
