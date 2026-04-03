import { api } from "@/lib/api/elysia/client";

const fetchYouTubeChannel = async (artistAccountId: string) => {
  const response = await api.youtube["channel-info"].get({
    query: { artist_account_id: artistAccountId },
  });

  if (response.error || !response.data) {
    throw new Error("Failed to fetch YouTube channel information");
  }

  return response.data;
};

export default fetchYouTubeChannel;
