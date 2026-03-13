import type { Page } from "@browserbasehq/stagehand";
import { normalizeInstagramUrl } from "./normalizeInstagramUrl";
import { simulateHumanScrolling } from "./simulateHumanScrolling";
import { dismissLoginModal } from "./dismissLoginModal";
import { BROWSER_TIMEOUTS } from "./constants";

/**
 * Perform initial page setup: navigate, wait, scroll, dismiss modal
 * Returns whether a modal was dismissed
 *
 * @param page
 * @param url
 */
export async function performPageSetup(page: Page, url: string): Promise<boolean> {
  const targetUrl = normalizeInstagramUrl(url);
  await page.goto(targetUrl, {
    waitUntil: "domcontentloaded",
    timeout: BROWSER_TIMEOUTS.PAGE_NAVIGATION,
  });

  // Wait for initial page load
  await page.waitForTimeout(BROWSER_TIMEOUTS.INITIAL_PAGE_LOAD);

  await simulateHumanScrolling(page);

  return await dismissLoginModal(page);
}
