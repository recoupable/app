/**
 * YouTube OAuth2 Callback Route
 *
 * Handles Google OAuth redirect after YouTube authentication.
 *
 * PROCESS:
 * - Exchanges authorization code for access/refresh tokens
 * - Saves tokens to database linked to artist_account_id from state parameter
 * - Redirects back to original page with success/error status
 *
 * STATE: Contains JSON with { path, artist_account_id } for context preservation
 */

import { NextRequest, NextResponse } from "next/server";
import insertYouTubeTokens from "@/lib/supabase/youtube_tokens/insertYouTubeTokens";
import { createYouTubeOAuthClient } from "@/lib/youtube/oauth-client";

const oauth2Client = createYouTubeOAuthClient();

/**
 *
 * @param request
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const error = searchParams.get("error");
  const state = searchParams.get("state"); // Contains JSON with path and artist_account_id

  // Parse state to get artist_account_id and redirect path
  let artist_account_id: string | null = null;
  let redirectPath = "/";

  if (state) {
    try {
      const stateData = JSON.parse(state);
      artist_account_id = stateData.artist_account_id;
      redirectPath = stateData.path || "/";
    } catch (parseError) {
      console.error("Error parsing state parameter:", parseError);
      // Fallback: treat state as just the path (old format)
      redirectPath = state;
    }
  }

  if (error) {
    console.error("YouTube auth error:", error);
    return NextResponse.redirect(
      new URL(
        redirectPath +
          (redirectPath.includes("?") ? "&" : "?") +
          "youtube_auth_error=" +
          encodeURIComponent(error as string),
        request.url,
      ),
    );
  }

  if (!code) {
    console.error("No authorization code provided");
    return NextResponse.redirect(
      new URL(
        redirectPath +
          (redirectPath.includes("?") ? "&" : "?") +
          "youtube_auth_error=No+code+provided",
        request.url,
      ),
    );
  }

  try {
    console.log("Exchanging authorization code for tokens...");
    const { tokens } = await oauth2Client.getToken(code);
    console.log("Tokens received:", {
      hasAccessToken: !!tokens.access_token,
      hasRefreshToken: !!tokens.refresh_token,
      expiryDate: tokens.expiry_date,
    });

    if (!tokens.access_token) {
      throw new Error("No access token received from YouTube");
    }

    // Ensure we have artist_account_id from the state parameter
    if (!artist_account_id) {
      console.error("No artist_account_id provided for token storage");
      return NextResponse.redirect(
        new URL(
          redirectPath +
            (redirectPath.includes("?") ? "&" : "?") +
            "youtube_auth_error=No+account+specified",
          request.url,
        ),
      );
    }

    // Calculate expires_at timestamp
    const expiresAt = tokens.expiry_date
      ? new Date(tokens.expiry_date - 60000).toISOString() // Subtract 1 minute for safety
      : new Date(Date.now() + 3600000).toISOString(); // Default to 1 hour from now

    // Save tokens to database
    const result = await insertYouTubeTokens({
      artist_account_id: artist_account_id,
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token || undefined,
      expires_at: expiresAt,
    });

    if (!result) {
      throw new Error("Failed to save YouTube tokens to database");
    }

    console.log("YouTube tokens saved to database successfully for account:", artist_account_id);
    console.log("YouTube authentication successful, redirecting...");
    return NextResponse.redirect(
      new URL(
        redirectPath + (redirectPath.includes("?") ? "&" : "?") + "youtube_auth=success",
        request.url,
      ),
    );
  } catch (err) {
    console.error("Error in YouTube auth callback:", err);
    const errorMessage = err instanceof Error ? err.message : "Error+getting+tokens";
    return NextResponse.redirect(
      new URL(
        redirectPath +
          (redirectPath.includes("?") ? "&" : "?") +
          "youtube_auth_error=" +
          encodeURIComponent(errorMessage),
        request.url,
      ),
    );
  }
}
