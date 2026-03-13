import { z } from "zod";
import { tool } from "ai";
import { withBrowser } from "@/lib/browser/withBrowser";
import { captureScreenshot } from "@/lib/browser/captureScreenshot";
import { detectPlatform } from "@/lib/browser/detectPlatform";
import { schemaToZod } from "@/lib/browser/schemaToZod";
import { normalizeInstagramUrl } from "@/lib/browser/normalizeInstagramUrl";
import { BROWSER_TIMEOUTS } from "@/lib/browser/constants";

export interface BrowserExtractResult {
  success: boolean;
  data?: unknown;
  initialScreenshotUrl?: string;
  finalScreenshotUrl?: string;
  sessionUrl?: string;
  platformName?: string;
  error?: string;
}

const browserExtract = tool({
  description: `Extract website data as JSON. Only use when user explicitly needs structured data format or mentions "as JSON"/"to save"/"to database". For normal data viewing, use browser_observe instead.`,
  inputSchema: z.object({
    url: z.string().url().describe("The URL of the webpage to extract data from"),
    schema: z
      .record(z.string())
      .describe(
        "Schema object defining the structure of data to extract (keys are field names, values are types: 'string', 'number', 'boolean', 'array')",
      ),
    instruction: z
      .string()
      .optional()
      .describe(
        "Optional instruction to guide the extraction (e.g., 'extract product information from the main listing')",
      ),
  }),
  execute: async ({ url, schema, instruction }) => {
    try {
      return await withBrowser(async (page, liveViewUrl, sessionUrl) => {
        const targetUrl = normalizeInstagramUrl(url);
        await page.goto(targetUrl, {
          waitUntil: "domcontentloaded",
          timeout: BROWSER_TIMEOUTS.PAGE_NAVIGATION,
        });

        const screenshotUrl = await captureScreenshot(page, url);
        const platformName = detectPlatform(url);

        const zodSchema = schemaToZod(schema);

        const extractResult = await page.extract({
          instruction: instruction || `Extract data according to the provided schema`,
          schema: zodSchema,
        });

        return {
          success: true,
          data: extractResult,
          initialScreenshotUrl: screenshotUrl,
          finalScreenshotUrl: screenshotUrl,
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

export default browserExtract;
