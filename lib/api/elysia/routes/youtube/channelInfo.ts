import { Elysia, t } from "elysia";
import { fetchYouTubeChannelInfo } from "@/lib/youtube/channel-fetcher";
import { validateYouTubeTokens } from "@/lib/youtube/token-validator";

const errorResponseSchema = t.String();

export const youtubeChannelInfoRoute = new Elysia().get(
  "/channel-info",
  async ({ query, status }) => {
    try {
      const tokenValidation = await validateYouTubeTokens(query.artist_account_id);

      if (!tokenValidation.success || !tokenValidation.tokens) {
        return status(403, "YouTube authentication required");
      }

      const channelResult = await fetchYouTubeChannelInfo({
        accessToken: tokenValidation.tokens.access_token,
        refreshToken: tokenValidation.tokens.refresh_token || "",
        includeBranding: true,
      });

      if (!channelResult.success) {
        return status(502, channelResult.error.message);
      }

      return channelResult.channelData;
    } catch (e) {
      return status(
        500,
        e instanceof Error
          ? `Failed to fetch YouTube channel information: ${e.message}`
          : "Failed to fetch YouTube channel information",
      );
    }
  },
  {
    auth: true,
    query: t.Object({
      artist_account_id: t.String(),
    }),
    response: {
      200: t.Array(t.Any()),
      401: errorResponseSchema,
      403: errorResponseSchema,
      502: errorResponseSchema,
      500: errorResponseSchema,
    },
    detail: {
      summary: "Get YouTube channel info for an artist account",
      description:
        "Returns authenticated YouTube channels for an artist account with validated credentials.",
      tags: ["youtube"],
      security: [{ apiKeyAuth: [] }],
    },
  },
);
