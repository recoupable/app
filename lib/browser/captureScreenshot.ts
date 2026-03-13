import type { Page } from "@browserbasehq/stagehand";
import { detectPlatform } from "./detectPlatform";
import { uploadScreenshot } from "./uploadScreenshot";

/**
 *
 * @param page
 * @param url
 */
export async function captureScreenshot(page: Page, url: string): Promise<string> {
  const screenshotBuffer = await page.screenshot();
  const screenshotBase64 = screenshotBuffer.toString("base64");
  const platformName = detectPlatform(url);
  const screenshotUrl = await uploadScreenshot(screenshotBase64, platformName);

  return screenshotUrl;
}
