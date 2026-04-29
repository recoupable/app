import { useEffect, useRef } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useArtistProvider } from "@/providers/ArtistProvider";
import { useVercelChatContext } from "@/providers/VercelChatProvider";
import { generateUUID } from "@/lib/generateUUID";
import fetchYouTubeChannel from "@/lib/youtube/fetchYouTubeChannel";
import { UIMessage, isToolUIPart, getToolName } from "ai";

/**
 * Hook that detects YouTube login success and automatically continues the conversation
 * Only triggers when the latest message's final tool call is youtube_login (indicating auth failure)
 * and valid tokens are found in the database (indicating auth success)
 */
export function useYouTubeLoginSuccess() {
  const { selectedArtist } = useArtistProvider();
  const { append, messages } = useVercelChatContext();
  const { getAccessToken } = usePrivy();
  const hasCheckedOAuth = useRef(false);

  useEffect(() => {
    // Only run once
    if (hasCheckedOAuth.current) {
      return;
    }

    // Check if this component is part of the latest message with YouTube tool call
    const latestMessage = messages[messages.length - 1] as UIMessage;
    if (!latestMessage || latestMessage.role !== "assistant") {
      return;
    }

    // Check if the FINAL tool call in the latest message is YouTube (meaning it failed)
    const parts = latestMessage.parts || [];
    const toolParts = parts.filter((part) => isToolUIPart(part));
    const lastToolPart = toolParts[toolParts.length - 1];

    // Type guard to check if it's a tool invocation with the right structure
    const isLastToolYouTube =
      lastToolPart &&
      isToolUIPart(lastToolPart) &&
      getToolName(lastToolPart) === "youtube_login";

    if (!isLastToolYouTube) {
      return;
    }

    hasCheckedOAuth.current = true;

    if (selectedArtist?.account_id) {
      // The fetch wrapper throws on non-2xx (including 401 re-auth);
      // success implies a 200 with at least one channel.
      (async () => {
        const accessToken = await getAccessToken();
        if (!accessToken) {
          return;
        }
        return fetchYouTubeChannel(selectedArtist.account_id, accessToken);
      })()
        .then((youtubeChannel) => {
          if (!youtubeChannel) return;
          if (
            Array.isArray(youtubeChannel?.channels) &&
            youtubeChannel.channels.length > 0
          ) {
            const successMessage = {
              id: generateUUID(),
              role: "user" as const,
              parts: [
                {
                  type: "text",
                  text: "Great! I've successfully connected my YouTube account. Please continue with what you were helping me with.",
                },
              ],
            } as UIMessage;

            append(successMessage);
          }
        })
        .catch(() => {
          // Re-auth still required — leave the youtube_login tool result
          // in place so the user can retry the OAuth flow.
        });
    }
  }, [messages, append, selectedArtist?.account_id, getAccessToken]);
}
