import { z } from "zod";
import { tool } from "ai";
import { getClientApiBaseUrl } from "@/lib/api/getClientApiBaseUrl";

// Response types
interface Post {
  id: string;
  post_url: string;
  updated_at: string;
  platform: string;
  social_id: string;
}

interface PostResponse {
  status: "success" | "error";
  posts: Post[];
  pagination: {
    total_count: number;
    page: number;
    limit: number;
    total_pages: number;
  };
}

// Zod schema for parameter validation
const schema = z.object({
  social_id: z.string().min(1, "Social ID is required"),
  latestFirst: z.boolean().optional().default(true),
  page: z.number().min(1).optional().default(1),
  limit: z.number().min(1).max(100).optional().default(20),
});

const getSocialPosts = (accessToken: string) =>
  tool({
    description:
      "Retrieve all social media posts from a specific social profile. This endpoint should be called after obtaining social IDs from the Artist Socials endpoint.",
    inputSchema: schema,
    execute: async ({
      social_id,
      latestFirst = true,
      page = 1,
      limit = 20,
    }) => {
      try {
        // Construct URL — social_id is a path segment; latestFirst/page/limit are query params
        const url = new URL(
          `${getClientApiBaseUrl()}/api/socials/${social_id}/posts`,
        );
        url.searchParams.append("latestFirst", latestFirst.toString());
        url.searchParams.append("page", page.toString());
        url.searchParams.append("limit", limit.toString());

        // Make the API request
        const response = await fetch(url.toString(), {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (!response.ok) {
          throw new Error(`API request failed with status ${response.status}`);
        }

        const data = (await response.json()) as PostResponse;

        return {
          success: true,
          ...data,
        };
      } catch (error) {
        console.error("Error fetching social posts:", error);
        return {
          success: false,
          status: "error",
          message:
            error instanceof Error
              ? error.message
              : "Failed to fetch social posts",
          posts: [],
          pagination: {
            total_count: 0,
            page: page,
            limit: limit,
            total_pages: 0,
          },
        };
      }
    },
  });

export default getSocialPosts;
