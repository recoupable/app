import { useQuery } from "@tanstack/react-query";
import fetchYouTubeChannel from "@/lib/youtube/fetchYouTubeChannel";

const useYoutubeChannel = (artistAccountId: string) => {
  return useQuery({
    queryKey: ["youtube-channel-info", artistAccountId],
    queryFn: () => fetchYouTubeChannel(artistAccountId),
    enabled: !!artistAccountId, // Only run query if artistAccountId is provided
  });
};

export default useYoutubeChannel;
