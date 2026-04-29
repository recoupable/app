import fetchYouTubeChannel from "@/lib/youtube/fetchYouTubeChannel";
import { YouTubeChannelResponse } from "@/types/youtube";
import { useQuery } from "@tanstack/react-query";

const useYoutubeChannel = (artistAccountId: string) => {
  return useQuery<YouTubeChannelResponse>({
    queryKey: ["youtube-channel-info", artistAccountId],
    queryFn: () => fetchYouTubeChannel(artistAccountId),
    enabled: !!artistAccountId, // Only run query if artistAccountId is provided
  });
};

export default useYoutubeChannel;
