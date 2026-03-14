import { YouTubeTokensRow, MonetizationCheckResult } from "@/types/youtube";
import { YouTubeErrorBuilder, YouTubeErrorMessages } from "@/lib/youtube/error-builder";
import { checkChannelMonetizationById } from "./channel-monetization-by-id";
import { createYouTubeAPIClient } from "./oauth-client";

/**
 * Convenience function to check monetization status for the authenticated user's channel
 * Automatically fetches the channel ID from the user's authenticated account
 *
 * @param tokens - Valid YouTube tokens with Analytics scope
 * @returns Promise with monetization status or error details
 */
export async function checkAuthenticatedChannelMonetization(
  tokens: YouTubeTokensRow,
): Promise<MonetizationCheckResult> {
  try {
    const youtube = createYouTubeAPIClient(tokens.access_token, tokens.refresh_token ?? undefined);

    const channelResponse = await youtube.channels.list({
      part: ["id"],
      mine: true,
    });

    if (!channelResponse.data.items || channelResponse.data.items.length === 0) {
      return YouTubeErrorBuilder.createUtilityError(
        "CHANNEL_NOT_FOUND",
        YouTubeErrorMessages.NO_CHANNELS,
      );
    }

    const channelId = channelResponse.data.items[0].id;
    if (!channelId) {
      return YouTubeErrorBuilder.createUtilityError(
        "CHANNEL_NOT_FOUND",
        YouTubeErrorMessages.NO_CHANNELS,
      );
    }

    // Now check monetization for this channel
    return await checkChannelMonetizationById(tokens, channelId);
  } catch (error: unknown) {
    console.error("Error fetching user's channel for monetization check:", error);
    return YouTubeErrorBuilder.createUtilityError(
      "API_ERROR",
      error instanceof Error ? error.message : YouTubeErrorMessages.API_ERROR,
    );
  }
}
