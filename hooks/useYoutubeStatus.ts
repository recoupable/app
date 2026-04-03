import { YoutubeStatus } from "@/types/youtube";
import useYoutubeChannel from "./useYoutubeChannel";

const useYoutubeStatus = (artistAccountId?: string) => {
  const {
    data: channelResponse,
    isLoading,
    error,
  } = useYoutubeChannel(artistAccountId || "");

  const data = artistAccountId
    ? {
        status: (() => {
          if (error) return "error";
          if (isLoading) return "invalid";
          if (Array.isArray(channelResponse) && channelResponse.length > 0) {
            return "valid";
          }
          return "invalid";
        })(),
        artistAccountId,
      }
    : null;

  return {
    data,
    isLoading,
    error: error ?? null,
  } as YoutubeStatus;
};

export default useYoutubeStatus;
