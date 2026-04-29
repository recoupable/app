import { getClientApiBaseUrl } from "@/lib/api/getClientApiBaseUrl";

/**
 * Fetches the YouTube channel summary for an artist. The API returns:
 * - 200 `{ status: "success", channels: [...] }` on the happy path
 * - 401 when stored YouTube tokens can't be validated/refreshed (re-auth)
 * - 502 when the upstream YouTube API call fails
 *
 * Any non-2xx response is surfaced as a thrown Error so callers (and
 * react-query) can branch on success vs. error states.
 */
const fetchYouTubeChannel = async (artistAccountId: string) => {
  const params = new URLSearchParams({ artist_account_id: artistAccountId });
  const response = await fetch(
    `${getClientApiBaseUrl()}/api/youtube/channel-info?${params.toString()}`,
  );

  if (!response.ok) {
    throw new Error(
      `YouTube channel-info request failed with status ${response.status}`,
    );
  }

  return response.json();
};

export default fetchYouTubeChannel;
