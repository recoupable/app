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
          if (channelResponse) {
            return channelResponse.tokenStatus === "valid"
              ? "valid"
              : "invalid";
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
