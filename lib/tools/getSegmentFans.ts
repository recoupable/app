import { z } from "zod";
import { tool } from "ai";

import { FanResponse } from "@/types/fans";

// Zod schema for parameter validation
const schema = z.object({
  segment_id: z.string().min(1, "Segment ID is required"),
  page: z.number().min(1).optional().default(1),
  limit: z.number().min(1).max(100).optional().default(20),
});

const getSegmentFans = tool({
  description:
    "Retrieve all social profiles from fans within a specific segment. This endpoint should be called after obtaining segment IDs from the Artist Segments endpoint.",
  inputSchema: schema,
  execute: async ({ segment_id, page, limit }) => {
    try {
      // Construct URL with query parameters
      const url = new URL("https://api.recoupable.com/api/segment/fans");
      url.searchParams.append("segment_id", segment_id);
      if (page) url.searchParams.append("page", page.toString());
      if (limit) url.searchParams.append("limit", limit.toString());

      // Make the API request
      const response = await fetch(url.toString(), {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = (await response.json()) as FanResponse;

      return {
        success: true,
        ...data,
      };
    } catch (error) {
      console.error("Error fetching segment fans:", error);
      return {
        success: false,
        status: "error",
        message: error instanceof Error ? error.message : "Failed to fetch segment fans",
        fans: [],
        pagination: {
          total_count: 0,
          page: page || 1,
          limit: limit || 20,
          total_pages: 0,
        },
      };
    }
  },
});

export default getSegmentFans;
