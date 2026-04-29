import { NextRequest, NextResponse } from "next/server";
import { validateYouTubeTokens } from "@/lib/youtube/token-validator";
import { fetchYouTubeChannelInfo } from "@/lib/youtube/channel-fetcher";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const artistAccountId = searchParams.get("artist_account_id");

    if (!artistAccountId) {
      return NextResponse.json(
        { 
          success: false,
          error: "Missing artist_account_id parameter",
          tokenStatus: "missing_param"
        },
        { status: 400 }
      );
    }

    const tokenValidation = await validateYouTubeTokens(artistAccountId);
    if (!tokenValidation.success) {
      return NextResponse.json(
        { 
          success: false,
          error: "YouTube authentication required",
          tokenStatus: "invalid",
          channels: null
        },
        { status: 200 }
      );
    }

    // Fetch channel information
    const channelResult = await fetchYouTubeChannelInfo({
      accessToken: tokenValidation.tokens!.access_token,
      refreshToken: tokenValidation.tokens!.refresh_token || "",
      includeBranding: true,
    });

    if (!channelResult.success) {
      return NextResponse.json(
        { 
          success: false,
          error: channelResult.error!.message,
          tokenStatus: "api_error",
          channels: null
        },
        { status: 200 }
      );
    }

    return NextResponse.json({
      success: true,
      channels: channelResult.channelData,
      tokenStatus: "valid"
    });
  } catch (error) {
    console.error("❌ Error in YouTube channel info API:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch YouTube channel information",
        details: error instanceof Error ? error.message : "Unknown error",
        tokenStatus: "error",
        channels: null
      },
      { status: 200 } // Return 200 so frontend can parse the response
    );
  }
}
