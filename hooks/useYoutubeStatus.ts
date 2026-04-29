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
          if (isLoading) return "invalid";
          // Any fetch error (e.g. 401 re-auth required) → invalid so the
          // UI prompts the user to reconnect their YouTube account.
          if (error) return "invalid";
          if (
            channelResponse &&
            Array.isArray(channelResponse.channels) &&
            channelResponse.channels.length > 0
          ) {
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
    error: null,
  } as YoutubeStatus;
};

export default useYoutubeStatus;
