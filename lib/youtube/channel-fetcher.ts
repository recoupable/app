import { createYouTubeAPIClient } from "@/lib/youtube/oauth-client";
import { YouTubeChannelData } from "@/types/youtube";
import {
  YouTubeErrorBuilder,
  YouTubeErrorMessages,
} from "@/lib/youtube/error-builder";

/**
 * Fetches YouTube channel information using authenticated tokens
 * @param params - { accessToken, refreshToken, includeBranding }
 * @returns Promise with array of channel data or error details
 */
export async function fetchYouTubeChannelInfo({
  accessToken,
  refreshToken,
  includeBranding = false,
}: {
  accessToken: string;
  refreshToken?: string;
  includeBranding?: boolean;
}): Promise<
  | { success: true; channelData: YouTubeChannelData[] }
  | { success: false; error: { code: string; message: string } }
> {
  try {
    // Create YouTube API client with tokens
    const youtube = createYouTubeAPIClient(accessToken, refreshToken);

    // Determine which parts to fetch based on requirements
    const parts = ["snippet", "statistics"];
    if (includeBranding) {
      parts.push("brandingSettings", "status");
    }

    // Fetch channel information
    const response = await youtube.channels.list({
      part: parts,
      mine: true,
    });

    if (!response.data.items || response.data.items.length === 0) {
      return YouTubeErrorBuilder.createUtilityError(
        "NO_CHANNELS",
        YouTubeErrorMessages.NO_CHANNELS
      );
    }

    // Map all channels
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const channelData = response.data.items.map((channelData: any) => ({
      id: channelData.id || "",
      title: channelData.snippet?.title || "",
      description: channelData.snippet?.description || "",
      uploadsPlaylistId: channelData.contentDetails?.relatedPlaylists?.uploads,
      thumbnails: {
        default: {
          url: channelData.snippet?.thumbnails?.default?.url || null,
        },
        medium: {
          url: channelData.snippet?.thumbnails?.medium?.url || null,
        },
        high: {
          url: channelData.snippet?.thumbnails?.high?.url || null,
        },
      },
      statistics: {
        subscriberCount: channelData.statistics?.subscriberCount || "0",
        videoCount: channelData.statistics?.videoCount || "0",
        viewCount: channelData.statistics?.viewCount || "0",
        hiddenSubscriberCount:
          channelData.statistics?.hiddenSubscriberCount === true,
      },
      customUrl: channelData.snippet?.customUrl || null,
      country: channelData.snippet?.country || null,
      publishedAt: channelData.snippet?.publishedAt || "",
      ...(includeBranding && {
        branding: {
          keywords: channelData.brandingSettings?.channel?.keywords || null,
          defaultLanguage:
            channelData.brandingSettings?.channel?.defaultLanguage || null,
        },
      }),
    }));

    return {
      success: true,
      channelData,
    };
  } catch (error: unknown) {
    console.error("Error fetching YouTube channel info:", error);

    // If token is invalid/expired, return appropriate error
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === 401
    ) {
      return YouTubeErrorBuilder.createUtilityError(
        "API_ERROR",
        YouTubeErrorMessages.AUTH_FAILED
      );
    }

    return YouTubeErrorBuilder.createUtilityError(
      "API_ERROR",
      error instanceof Error ? error.message : YouTubeErrorMessages.API_ERROR
    );
  }
}
