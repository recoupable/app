import type { Page } from "@browserbasehq/stagehand";
import { initStagehand } from "./initStagehand";

/**
 *
 * @param operation
 */
export async function withBrowser<T>(
  operation: (page: Page, liveViewUrl?: string, sessionUrl?: string) => Promise<T>,
): Promise<T> {
  const { stagehand, liveViewUrl, sessionUrl } = await initStagehand();

  try {
    const result = await operation(stagehand.page, liveViewUrl, sessionUrl);
    await stagehand.close();
    return result;
  } catch (error) {
    try {
      await stagehand.close();
    } catch (closeError) {
      console.warn("[withBrowser] Failed to close stagehand during error cleanup:", closeError);
    }
    throw error;
  }
}
