import { tool } from "ai";
import { z } from "zod";

// Types for the API response
export interface GetTwitterTrendsResponse {
  status: "success" | "error";
  trends: string[];
  message?: string;
}

const getTwitterTrends = tool({
  description:
    "Retrieve the current trending topics from Twitter using the Recoup API. Returns an array of trending topic strings.",
  inputSchema: z.object({}),
  execute: async (): Promise<GetTwitterTrendsResponse> => {
    try {
      const url = "https://api.recoupable.com/api/x/trends";
      const response = await fetch(url, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = (await response.json()) as GetTwitterTrendsResponse;
      return {
        status: data.status,
        trends: data.trends,
      };
    } catch (error) {
      console.error("Error fetching Twitter trends:", error);
      return {
        status: "error",
        trends: [],
        message: error instanceof Error ? error.message : "Failed to fetch Twitter trends",
      };
    }
  },
});

export default getTwitterTrends;
