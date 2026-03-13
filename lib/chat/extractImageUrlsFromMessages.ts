import { UIMessage } from "ai";

/**
 * Extracts image URLs from user messages with file attachments
 *
 * @param messages - Array of UI messages from the chat
 * @returns Array of image URLs found in message attachments
 */
export function extractImageUrlsFromMessages(messages: UIMessage[]): string[] {
  const imageUrls: string[] = [];

  for (const message of messages) {
    if (message.parts) {
      for (const part of message.parts) {
        if (
          part.type === "file" &&
          part.mediaType?.startsWith("image/") &&
          typeof part.url === "string" &&
          part.url.trim() !== ""
        ) {
          imageUrls.push(part.url);
        }
      }
    }
  }

  return imageUrls;
}
