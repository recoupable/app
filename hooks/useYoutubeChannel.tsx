import fetchYouTubeChannel from "@/lib/youtube/fetchYouTubeChannel";
import { YouTubeChannelResponse } from "@/types/youtube";
import { usePrivy } from "@privy-io/react-auth";
import { useQuery } from "@tanstack/react-query";

const useYoutubeChannel = (artistAccountId: string) => {
  const { getAccessToken, authenticated } = usePrivy();

  return useQuery<YouTubeChannelResponse>({
    queryKey: ["youtube-channel-info", artistAccountId],
    queryFn: async () => {
      const accessToken = await getAccessToken();
      if (!accessToken) {
        throw new Error("No access token");
      }
      return fetchYouTubeChannel(artistAccountId, accessToken);
    },
    enabled: !!artistAccountId && authenticated,
  });
};

export default useYoutubeChannel;
