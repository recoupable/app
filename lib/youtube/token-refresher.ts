/**
 * YouTube Token Refresh Utility
 * 
 * Handles automatic refresh of expired YouTube access tokens using refresh tokens.
 * Provides a clean, reusable interface for token refresh operations.
 */

import { createYouTubeOAuthClient } from "@/lib/youtube/oauth-client";
import insertYouTubeTokens from "@/lib/supabase/youtube_tokens/insertYouTubeTokens";
import { YouTubeTokensRow } from "@/types/youtube";
import { YouTubeErrorBuilder, YouTubeErrorMessages } from "@/lib/youtube/error-builder";

export interface TokenRefreshResult {
  success: boolean;
  tokens?: YouTubeTokensRow;
  error?: {
    code: 'REFRESH_INCOMPLETE_CREDENTIALS' | 'DB_UPDATE_FAILED' | 'REFRESH_INVALID_GRANT' | 'REFRESH_GENERAL_FAILURE';
    message: string;
  };
}

/**
 * Refreshes an expired YouTube access token using the refresh token
 * 
 * @param storedTokens - The current stored tokens including refresh_token
 * @param artist_account_id - Artist account ID for logging purposes
 * @returns Promise with refresh result containing new tokens or error details
 */
export async function refreshStoredYouTubeToken(
  storedTokens: YouTubeTokensRow, 
  artist_account_id: string
): Promise<TokenRefreshResult> {
  
  if (!storedTokens.refresh_token) {
    return YouTubeErrorBuilder.createUtilityError(
      'REFRESH_GENERAL_FAILURE', 
      'No refresh token available for token refresh'
    );
  }

  console.log(`Access token for account ${artist_account_id} expired. Attempting refresh.`);
  
  try {
    // Configure OAuth2 client with refresh token
    const oauth2Client = createYouTubeOAuthClient();
    oauth2Client.setCredentials({ refresh_token: storedTokens.refresh_token });

    // Request new access token
    const { credentials } = await oauth2Client.refreshAccessToken();
    console.log(`Successfully refreshed token for account ${artist_account_id}`);

    // Validate refresh response
    if (!credentials.access_token || !credentials.expiry_date) {
      console.error("Refresh token response missing access_token or expiry_date", credentials);
      return YouTubeErrorBuilder.createUtilityError(
        'REFRESH_INCOMPLETE_CREDENTIALS', 
        YouTubeErrorMessages.REFRESH_INCOMPLETE_CREDENTIALS
      );
    }
    
    // Prepare updated token data
    const newExpiresAt = new Date(credentials.expiry_date).toISOString();
    const updatedTokensData: YouTubeTokensRow = {
      ...storedTokens, // Preserve existing fields (created_at, account_id, etc.)
      access_token: credentials.access_token,
      expires_at: newExpiresAt,
      // refresh_token remains the same from storedTokens
    };

    // Update tokens in database
    const updateResult = await insertYouTubeTokens(updatedTokensData);

    if (!updateResult) {
      console.error(`Failed to update refreshed tokens in DB for account ${artist_account_id}`);
      return YouTubeErrorBuilder.createUtilityError(
        'DB_UPDATE_FAILED', 
        YouTubeErrorMessages.DB_UPDATE_FAILED
      );
    }
    
    console.log(`Successfully updated tokens in DB for account ${artist_account_id}`);
    return {
      success: true,
      tokens: updateResult,
    };

  } catch (refreshError: unknown) {
    console.error(`Error refreshing YouTube token for account ${artist_account_id}:`, refreshError);
    
    // Handle specific Google OAuth errors
    if (refreshError && typeof refreshError === 'object' && 'response' in refreshError && 
        refreshError.response && typeof refreshError.response === 'object' && 'data' in refreshError.response &&
        refreshError.response.data && typeof refreshError.response.data === 'object' && 'error' in refreshError.response.data &&
        refreshError.response.data.error === 'invalid_grant') {
      return YouTubeErrorBuilder.createUtilityError(
        'REFRESH_INVALID_GRANT', 
        YouTubeErrorMessages.REFRESH_INVALID_GRANT
      );
    }
    
    // General refresh failure
    return YouTubeErrorBuilder.createUtilityError(
      'REFRESH_GENERAL_FAILURE', 
      YouTubeErrorMessages.REFRESH_GENERAL_FAILURE
    );
  }
}