import { UIMessage } from "ai";

/**
 *
 * @param messages
 */
export default function getLatestUserMessageText(messages: UIMessage[]): string {
  const userMessages = messages.filter(msg => msg.role === "user");
  const latestUserMessage = userMessages[userMessages.length - 1];
  return latestUserMessage?.parts.find(part => part.type === "text")?.text || "";
}
