import { getClientApiBaseUrl } from "@/lib/api/getClientApiBaseUrl";

const fetchYouTubeChannel = async (artistAccountId: string) => {
  const response = await fetch(
    `${getClientApiBaseUrl()}/api/youtube/channel-info?artist_account_id=${artistAccountId}`,
  );

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
};

export default fetchYouTubeChannel;
