import { createYouTubeAnalyticsClient } from "@/lib/youtube/youtube-analytics-oauth-client";
import { YouTubeTokensRow, MonetizationCheckResult } from "@/types/youtube";
import { YouTubeErrorBuilder, YouTubeErrorMessages } from "@/lib/youtube/error-builder";

/**
 * Checks if a YouTube channel is monetized by attempting to fetch revenue data
 * Uses YouTube Analytics API to query estimatedRevenue for yesterday
 *
 * Required OAuth scopes:
 * - https://www.googleapis.com/auth/yt-analytics.readonly
 * - https://www.googleapis.com/auth/yt-analytics-monetary.readonly
 *
 * @param tokens - Valid YouTube tokens with Analytics scope
 * @param channelId - YouTube channel ID to check
 * @returns Promise with monetization status or error details
 */
export async function checkChannelMonetizationById(
  tokens: YouTubeTokensRow,
  channelId: string,
): Promise<MonetizationCheckResult> {
  try {
    // Create YouTube Analytics API client
    const ytAnalytics = createYouTubeAnalyticsClient(
      tokens.access_token,
      tokens.refresh_token ?? undefined,
    );

    // Use yesterday's date for the query (YYYY-MM-DD format)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const isoDate = yesterday.toISOString().split("T")[0];

    // Query estimated revenue for yesterday
    const response = await ytAnalytics.reports.query({
      ids: `channel==${channelId}`,
      startDate: isoDate,
      endDate: isoDate,
      metrics: "estimatedRevenue",
    });

    // Interpret the response
    const rows = response.data.rows || [];

    if (rows.length === 0) {
      // No data returned - channel is not monetized
      return {
        success: true,
        isMonetized: false,
      };
    }

    // Check if we got valid revenue data (even if $0)
    const revenueValue = rows[0]?.[0];
    if (revenueValue !== undefined && revenueValue !== null) {
      // Valid numeric response indicates monetization is enabled
      return {
        success: true,
        isMonetized: true,
      };
    }

    // Fallback: treat as not monetized
    return {
      success: true,
      isMonetized: false,
    };
  } catch (error: unknown) {
    console.error("Error checking channel monetization:", error);

    // Handle specific API errors
    if (error && typeof error === "object" && "code" in error) {
      const apiError = error as { code: number; message?: string };

      if (apiError.code === 401) {
        return YouTubeErrorBuilder.createUtilityError(
          "EXPIRED",
          YouTubeErrorMessages.EXPIRED_TOKENS,
        );
      }

      if (apiError.code === 403) {
        // Check if it's a scope issue
        const errorMessage = apiError.message || "";
        if (errorMessage.includes("scope") || errorMessage.includes("permission")) {
          return YouTubeErrorBuilder.createUtilityError(
            "INSUFFICIENT_SCOPE",
            YouTubeErrorMessages.INSUFFICIENT_SCOPE,
          );
        }
        return YouTubeErrorBuilder.createUtilityError(
          "CHANNEL_NOT_FOUND",
          YouTubeErrorMessages.CHANNEL_NOT_FOUND,
        );
      }
    }

    return YouTubeErrorBuilder.createUtilityError(
      "ANALYTICS_ERROR",
      error instanceof Error ? error.message : YouTubeErrorMessages.ANALYTICS_ERROR,
    );
  }
}
