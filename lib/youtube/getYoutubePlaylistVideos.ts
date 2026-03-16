import { createYouTubeAPIClient } from "./oauth-client";
import { youtube_v3 } from "googleapis";

/**
 * Fetches videos from a YouTube playlist using the YouTube API client,
 * then fetches full video details using the videos.list endpoint.
 *
 * @param access_token.access_token
 * @param access_token - OAuth access token
 * @param refresh_token - OAuth refresh token (optional)
 * @param playlist_id - The playlist ID
 * @param max_results - Maximum number of results to return (default 25)
 * @param access_token.refresh_token
 * @param access_token.playlist_id
 * @param access_token.max_results
 * @returns An object with videos (full details), nextPageToken, totalResults, resultsPerPage
 */
export async function getYoutubePlaylistVideos({
  access_token,
  refresh_token,
  playlist_id,
  max_results = 50,
}: {
  access_token: string;
  refresh_token?: string;
  playlist_id: string;
  max_results?: number;
}) {
  const youtube = createYouTubeAPIClient(access_token, refresh_token);

  // Step 1: Get videos from the playlist
  const playlistResponse = await youtube.playlistItems.list({
    playlistId: playlist_id,
    part: ["snippet", "contentDetails", "status"],
    maxResults: max_results,
  });

  const items = playlistResponse.data.items || [];
  const videoIds = items
    .map(item => item.contentDetails?.videoId)
    .filter((id): id is string => Boolean(id));

  let videos: youtube_v3.Schema$Video[] = [];
  if (videoIds.length > 0) {
    // Step 2: Fetch full video details using videos.list
    const videosResponse = await youtube.videos.list({
      id: videoIds,
      part: [
        "id",
        "snippet",
        "contentDetails",
        "status",
        "statistics",
        "player",
        "liveStreamingDetails",
        "localizations",
      ],
      maxResults: videoIds.length,
    });
    videos = videosResponse.data.items || [];
  }

  return {
    videos,
    nextPageToken: playlistResponse.data.nextPageToken,
    totalResults: playlistResponse.data.pageInfo?.totalResults,
    resultsPerPage: playlistResponse.data.pageInfo?.resultsPerPage,
  };
}
