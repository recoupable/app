import { google } from "googleapis";

/**
 * Create and configure a YouTube OAuth2 client
 *
 * @returns Configured OAuth2 client
 */
export function createYouTubeOAuthClient() {
  return new google.auth.OAuth2(
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${process.env.NEXT_PUBLIC_URL}/api/auth/callback/google`,
  );
}

/**
 * Create a YouTube API client with authentication
 *
 * @param accessToken - YouTube access token
 * @param refreshToken - YouTube refresh token (optional)
 * @returns Configured YouTube API client
 */
export function createYouTubeAPIClient(accessToken: string, refreshToken?: string) {
  const oauth2Client = createYouTubeOAuthClient();

  oauth2Client.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken,
  });

  return google.youtube({
    version: "v3",
    auth: oauth2Client,
  });
}
