/**
 *
 * @param artist_account_id
 */
export function youtubeLogin(artist_account_id?: string) {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const redirectUri = `${process.env.NEXT_PUBLIC_URL}/api/auth/callback/google`;

  // Updated scopes to include YouTube Analytics and monetary data
  const scopes = [
    "https://www.googleapis.com/auth/youtube.readonly", // Base YouTube access
    "https://www.googleapis.com/auth/yt-analytics.readonly", // Analytics data e.g. views, likes, comments etc.
    "https://www.googleapis.com/auth/yt-analytics-monetary.readonly", // Revenue/monetization data e.g. ad revenue, channel membership, etc.
    "https://www.googleapis.com/auth/youtube", // For youtube.thumbnails.set
  ];

  // Get current path to redirect back after authentication
  const currentPath = window.location.pathname + window.location.search;

  // Create state object with path and artist_account_id
  const stateData = {
    path: currentPath,
    artist_account_id,
  };

  const authUrl =
    `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${clientId}&` +
    `redirect_uri=${encodeURIComponent(redirectUri)}&` +
    `scope=${encodeURIComponent(scopes.join(" "))}&` +
    `response_type=code&` +
    `access_type=offline&` +
    `prompt=consent&` +
    `state=${encodeURIComponent(JSON.stringify(stateData))}`;

  window.open(authUrl, "_blank");
}
