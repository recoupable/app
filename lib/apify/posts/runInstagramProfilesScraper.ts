import { APIFY_WEBHOOKS_VALUE } from "@/lib/consts";
import { ApifyScraperResult } from "@/lib/apify/types";

/**
 * Runs the Instagram profiles scraper for the provided handles
 *
 * @param handles - Array of Instagram handles to fetch profile data for
 * @returns Promise with runId, datasetId, and error information
 */
export default async function runInstagramProfilesScraper(
  handles: string[],
): Promise<ApifyScraperResult> {
  try {
    if (!handles || handles.length === 0) {
      return {
        runId: "",
        datasetId: "",
        error: "At least one Instagram handle is required",
      };
    }

    // Construct URL with handles as query parameters
    const url = new URL("https://api.recoupable.com/api/instagram/profiles");
    handles.forEach(handle => {
      url.searchParams.append("handles", handle);
    });

    // Add webhooks parameter with shared constant
    url.searchParams.append("webhooks", APIFY_WEBHOOKS_VALUE);

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error in runInstagramProfilesScraper:", error);
    return {
      runId: "",
      datasetId: "",
      error: error instanceof Error ? error.message : "Failed to scrape Instagram profiles",
    };
  }
}
