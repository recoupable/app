import { getClientApiBaseUrl } from "@/lib/api/getClientApiBaseUrl";

const fetchYouTubeChannel = async (artistAccountId: string) => {
  const params = new URLSearchParams({ artist_account_id: artistAccountId });
  const response = await fetch(
    `${getClientApiBaseUrl()}/api/youtube/channel-info?${params.toString()}`,
  );

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
};

export default fetchYouTubeChannel;
