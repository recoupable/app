import { NEW_API_BASE_URL } from "@/lib/consts";
import { z } from "zod";
import { tool } from "ai";

// Response types
interface Segment {
  id: string;
  artist_account_id: string;
  segment_id: string;
  updated_at: string;
  segment_name: string;
  artist_name: string;
}

interface SegmentResponse {
  status: "success" | "error";
  segments: Segment[];
  pagination: {
    total_count: number;
    page: number;
    limit: number;
    total_pages: number;
  };
}

// Zod schema for parameter validation
const schema = z.object({
  artist_account_id: z.string().min(1, "Artist account ID is required"),
  page: z.number().min(1).optional().default(1),
  limit: z.number().min(1).max(100).optional().default(20),
});

const getArtistSegments = tool({
  description:
    "Retrieve all segments associated with an artist. This endpoint should be called before using the Segment Fans endpoint to obtain the necessary segment IDs.",
  inputSchema: schema,
  execute: async ({ artist_account_id, page, limit }) => {
    try {
      // Construct URL with query parameters
      const url = new URL(`${NEW_API_BASE_URL}/api/artist/segments`);
      url.searchParams.append("artist_account_id", artist_account_id);
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

      const data = (await response.json()) as SegmentResponse;

      return {
        success: true,
        ...data,
      };
    } catch (error) {
      console.error("Error fetching artist segments:", error);
      return {
        success: false,
        status: "error",
        message: error instanceof Error ? error.message : "Failed to fetch artist segments",
        segments: [],
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

export default getArtistSegments;
