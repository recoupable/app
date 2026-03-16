import type { BrowserToolResultType } from "@/components/VercelChat/tools/browser/BrowserToolResult";

/**
 * Detect result type and compute display values
 *
 * @param result
 */
export function getBrowserResultType(result: BrowserToolResultType) {
  const isExtractResult = result.data !== undefined;
  const isMessageResult = result.message !== undefined;
  const displayScreenshot =
    result.finalScreenshotUrl || result.initialScreenshotUrl || result.screenshotUrl;

  const title = isExtractResult
    ? "Data Extracted Successfully"
    : isMessageResult
      ? "Page Observed Successfully"
      : "Operation completed successfully";

  return { isExtractResult, isMessageResult, displayScreenshot, title };
}
