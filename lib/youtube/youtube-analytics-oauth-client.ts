import { createYouTubeOAuthClient } from "./oauth-client";
import { google } from "googleapis";

/**
 * Create a YouTube Analytics API client with authentication
 *
 * @param accessToken - YouTube access token with Analytics scope
 * @param refreshToken - YouTube refresh token (optional)
 * @returns Configured YouTube Analytics API client
 */
export function createYouTubeAnalyticsClient(accessToken: string, refreshToken?: string) {
  const oauth2Client = createYouTubeOAuthClient();

  oauth2Client.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken,
  });

  return google.youtubeAnalytics({
    version: "v2",
    auth: oauth2Client,
  });
}
