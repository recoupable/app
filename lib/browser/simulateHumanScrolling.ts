import type { Page } from "@browserbasehq/stagehand";

/**
 * Simulate human-like scrolling behavior to appear more natural
 * Scrolls down and then back up with smooth animations and delays
 *
 * @param page
 */
export async function simulateHumanScrolling(page: Page): Promise<void> {
  try {
    // Scroll down
    await page.evaluate(() => {
      window.scrollTo({ top: 300, behavior: "smooth" });
    });
    await page.waitForTimeout(1500);

    // Scroll back up
    await page.evaluate(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
    await page.waitForTimeout(1000);
  } catch {
    // Scrolling behavior skipped - continue silently
  }
}
