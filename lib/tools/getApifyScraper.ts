import { z } from "zod";
import { tool } from "ai";

// Define the schema for input validation
const schema = z.object({
  runId: z.string().describe("The ID of the Apify run to check status for"),
});

/**
 * Interface for Apify scraper response
 */
export type ApifyScraperResponse = z.infer<typeof apifyScraperResponseSchema>;

const apifyScraperResponseSchema = z.union([
  z.object({
    status: z.string(),
    datasetId: z.string(),
  }),
  z.array(z.record(z.unknown())),
]);

// Define the get_apify_scraper tool
const getApifyScraper = tool({
  description: `Check the status and retrieve results from Apify scraper runs.
  
This tool uses the Apify API Client to fetch the current status of a scraper run and its results if available.`,
  inputSchema: schema,
  execute: async ({ runId }): Promise<ApifyScraperResponse> => {
    try {
      const response = await fetch(
        `https://api.recoupable.com/api/apify/scraper?runId=${encodeURIComponent(runId)}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch Apify scraper results: ${response.statusText}`);
      }

      const data = await response.json();
      return apifyScraperResponseSchema.parse(data);
    } catch (error) {
      console.error("Error in getApifyScraper tool:", error);
      throw error instanceof Error ? error : new Error("Failed to fetch Apify scraper results");
    }
  },
});

export default getApifyScraper;
