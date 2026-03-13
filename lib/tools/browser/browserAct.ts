import { z } from "zod";
import { tool } from "ai";
import { withBrowser } from "@/lib/browser/withBrowser";
import { captureScreenshot } from "@/lib/browser/captureScreenshot";
import { detectPlatform } from "@/lib/browser/detectPlatform";
import { normalizeInstagramUrl } from "@/lib/browser/normalizeInstagramUrl";
import { isBlockedStartUrl } from "@/lib/browser/isBlockedStartUrl";
import { BROWSER_TIMEOUTS } from "@/lib/browser/constants";

export interface BrowserActResult {
  success: boolean;
  message?: string;
  screenshotUrl?: string;
  sessionUrl?: string;
  platformName?: string;
  error?: string;
}

const browserAct = tool({
  description: `Perform ONE action on a website. Use when user says "click/scroll/close [something] on [website]". Example: "Click About on fatbeats.com" or "Close the popup on Instagram". For multi-step tasks, use browser_agent.`,
  inputSchema: z.object({
    url: z
      .string()
      .url()
      .refine(url => {
        try {
          const parsed = new URL(url);
          return parsed.protocol === "http:" || parsed.protocol === "https:";
        } catch {
          return false;
        }
      }, "URL must use http or https protocol")
      .refine(url => !isBlockedStartUrl(url), "URL points to a private or disallowed host")
      .describe("The URL of the webpage to interact with"),
    action: z
      .string()
      .min(1, "Action is required")
      .max(500, "Action description must be 500 characters or less")
      .refine(action => {
        // Remove dangerous patterns (script tags, protocol handlers)
        const dangerous = /<script|javascript:|data:|vbscript:/i;
        return !dangerous.test(action);
      }, "Action contains potentially dangerous content")
      .transform(action => action.trim().replace(/\s+/g, " "))
      .describe(
        "Natural language description of the action to perform (e.g., 'click the submit button')",
      ),
  }),
  execute: async ({ url, action }) => {
    try {
      return await withBrowser(async (page, liveViewUrl, sessionUrl) => {
        const targetUrl = normalizeInstagramUrl(url);
        await page.goto(targetUrl, {
          waitUntil: "domcontentloaded",
          timeout: BROWSER_TIMEOUTS.PAGE_NAVIGATION,
        });
        await page.act(action);

        const screenshotUrl = await captureScreenshot(page, url);
        const platformName = detectPlatform(url);

        return {
          success: true,
          message: `Successfully executed action: ${action}`,
          screenshotUrl,
          sessionUrl,
          platformName,
        };
      });
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  },
});

export default browserAct;
