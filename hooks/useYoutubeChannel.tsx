import { useQuery } from "@tanstack/react-query";
import { usePrivy } from "@privy-io/react-auth";
import {
  fetchYoutubeChannel,
  type YouTubeChannelStatisticsResponse,
} from "@/lib/youtube/fetchYoutubeChannel";

const useYoutubeChannel = (artistAccountId: string) => {
  const { getAccessToken } = usePrivy();
  return useQuery<YouTubeChannelStatisticsResponse>({
    queryKey: ["youtube-channel-info", artistAccountId],
    queryFn: async () => {
      const accessToken = await getAccessToken();
      if (!accessToken) {
        throw new Error("Not authenticated");
      }
      return fetchYoutubeChannel(accessToken, artistAccountId);
    },
    enabled: !!artistAccountId,
  });
};

export default useYoutubeChannel;
