import { z } from "zod";
import { tool } from "ai";

// Supported search modes from the Recoup API docs
const SEARCH_MODES = ["Top", "Latest", "Photos", "Videos", "Users"] as const;
export type SearchMode = (typeof SEARCH_MODES)[number];

// Common Twitter search operators
const SEARCH_OPERATORS = {
  from: "from:username - tweets from a specific user",
  to: "to:username - tweets to a specific user",
  min_faves: "min_faves:100 - tweets with at least 100 likes",
  min_retweets: "min_retweets:10 - tweets with at least 10 retweets",
  since: "since:2024-01-01 - tweets since a specific date",
  until: "until:2024-01-01 - tweets until a specific date",
  filter: "filter:links - tweets containing links",
  lang: "lang:en - tweets in a specific language",
} as const;

// Zod schema for parameter validation
const schema = z.object({
  query: z.string().min(1, "Search query is required"),
  maxTweets: z.number().min(1).max(1000).describe("Maximum number of tweets to return (1-1000)"),
  searchMode: z
    .enum(SEARCH_MODES)
    .optional()
    .describe("Optional search mode: Top, Latest, Photos, Videos, Users"),
});

// Types for the API response
export interface TwitterPhoto {
  id: string;
  url: string;
}

export interface TwitterVideo {
  id: string;
  preview: string;
  url: string;
}

export interface Tweet {
  id: string;
  text: string;
  username: string;
  timestamp: number;
  createdAt: string;
  isReply: boolean;
  isRetweet: boolean;
  likes: number;
  retweetCount: number;
  replies: number;
  photos: TwitterPhoto[];
  videos: TwitterVideo[];
  urls: string[];
  permanentUrl: string;
  quotedStatusId?: string;
  inReplyToStatusId?: string;
  hashtags: string[];
}

export interface SearchTwitterResponse {
  status: "success" | "error";
  tweets: Tweet[];
  message?: string;
}

const searchTwitter = tool({
  description: `Search for tweets using the Recoup Twitter Search API. 

This tool must follow this exact sequence:
<tool_loop>
  1. get_artist_socials - get the connected Twitter handle for the active artist
  2. search_twitter - search for tweets using the handle and provided query
</tool_loop>

Common search operators:
${Object.entries(SEARCH_OPERATORS)
  .map(([operator, description]) => `- ${operator}: ${description}`)
  .join("\n")}

Example queries:
- "from:username concert announcement" - Find concert announcements from a specific artist
- "to:username min_faves:100" - Find popular tweets directed to an artist
- "filter:links lang:en" - Find English tweets containing links
- "since:2024-01-01 until:2024-03-01" - Find tweets within a date range

You can combine these operators to create powerful search queries. For example:
"from:artistname min_faves:1000 filter:links" will find popular tweets with links from a specific artist.

Note: The tool will automatically use get_artist_socials to find the correct Twitter handle before searching.`,
  inputSchema: schema,
  execute: async ({ query, maxTweets, searchMode }): Promise<SearchTwitterResponse> => {
    try {
      const url = new URL("https://api.recoupable.com/api/x/search");
      url.searchParams.append("query", query);
      url.searchParams.append("maxTweets", maxTweets.toString());
      if (searchMode) url.searchParams.append("searchMode", searchMode);

      const response = await fetch(url.toString(), {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = (await response.json()) as SearchTwitterResponse;
      return {
        status: data.status,
        tweets: data.tweets,
      };
    } catch (error) {
      console.error("Error searching Twitter:", error);
      return {
        status: "error",
        tweets: [],
        message: error instanceof Error ? error.message : "Failed to search Twitter",
      };
    }
  },
});

export default searchTwitter;
