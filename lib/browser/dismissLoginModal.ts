import type { Page } from "@browserbasehq/stagehand";

/**
 * Attempt to automatically dismiss login modals/popups
 * Returns true if a modal was dismissed, false otherwise
 *
 * @param page
 */
export async function dismissLoginModal(page: Page): Promise<boolean> {
  try {
    await page.act("close the login popup");
    // Wait for modal to close and content to be visible
    await page.waitForTimeout(2000);
    return true;
  } catch {
    // No modal found or could not dismiss - continue anyway
    return false;
  }
}
