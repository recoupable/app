import { executeConnectorActionApi } from "@/lib/composio/api/executeConnectorActionApi";

/**
 * One channel item returned by Composio's YOUTUBE_GET_CHANNEL_STATISTICS
 * action. Mirrors Google's `youtube.channels.list` response shape — fields
 * are read directly from `snippet` / `statistics` / `brandingSettings`.
 */
export interface YouTubeChannelItem {
  id: string;
  snippet?: {
    title?: string;
    description?: string;
    customUrl?: string;
    publishedAt?: string;
    thumbnails?: {
      default?: { url?: string };
      medium?: { url?: string };
      high?: { url?: string };
    };
  };
  statistics?: {
    subscriberCount?: string;
    videoCount?: string;
    viewCount?: string;
    hiddenSubscriberCount?: boolean;
  };
  brandingSettings?: {
    channel?: {
      keywords?: string;
      defaultLanguage?: string;
    };
  };
}

export interface YouTubeChannelStatisticsResponse {
  items?: YouTubeChannelItem[];
}

/**
 * Fetch the YouTube channel owned by `artistAccountId`'s Composio-connected
 * account. Asks for `snippet,statistics` (Composio defaults to `statistics`
 * only, which omits the title/thumbnails the UI needs).
 */
export async function fetchYoutubeChannel(
  accessToken: string,
  artistAccountId: string,
): Promise<YouTubeChannelStatisticsResponse> {
  return executeConnectorActionApi<YouTubeChannelStatisticsResponse>(
    accessToken,
    {
      actionSlug: "YOUTUBE_GET_CHANNEL_STATISTICS",
      parameters: { mine: true, part: "snippet,statistics" },
      accountId: artistAccountId,
    },
  );
}
