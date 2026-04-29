import { useEffect, useRef } from "react";
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
      fetchYouTubeChannel(selectedArtist.account_id).then((youtubeChannel) => {
        if (youtubeChannel.success) {
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
      });
    }
  }, [messages, append, selectedArtist?.account_id]);
}
