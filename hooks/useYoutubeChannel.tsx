import { useQuery } from "@tanstack/react-query";
import { usePrivy } from "@privy-io/react-auth";
import { executeConnectorActionApi } from "@/lib/composio/api/executeConnectorActionApi";

/**
 * One channel item returned by Composio's YouTube_GET_CHANNEL_STATISTICS
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

interface YouTubeChannelStatisticsResponse {
  items?: YouTubeChannelItem[];
}

const useYoutubeChannel = (artistAccountId: string) => {
  const { getAccessToken } = usePrivy();
  return useQuery<YouTubeChannelStatisticsResponse>({
    queryKey: ["youtube-channel-info", artistAccountId],
    queryFn: async () => {
      const accessToken = await getAccessToken();
      if (!accessToken) {
        throw new Error("Not authenticated");
      }
      return executeConnectorActionApi<YouTubeChannelStatisticsResponse>(
        accessToken,
        {
          actionSlug: "YOUTUBE_GET_CHANNEL_STATISTICS",
          parameters: { mine: true },
          accountId: artistAccountId,
        },
      );
    },
    enabled: !!artistAccountId,
  });
};

export default useYoutubeChannel;
