import { escapeTelegramMarkdown } from "./escapeTelegramMarkdown";
import { ErrorContext } from "./sendErrorNotification";

/**
 * Formats error message for Telegram notification and escapes for Telegram Markdown.
 *
 * @param params - Error context object
 * @returns Escaped, formatted error message string
 */
export function formatErrorMessage(params: ErrorContext): string {
  const { error, email = "unknown", roomId = "new chat", path, messages } = params;
  const timestamp = new Date().toISOString();

  let message = `❌ Error Alert\n`;
  message += `From: ${email}\n`;
  message += `Room ID: ${roomId}\n`;
  message += `Time: ${timestamp}\n\n`;

  message += `Error Message:\n${error.message}\n\n`;

  if (error.name) {
    message += `Error Type: ${error.name}\n\n`;
  }

  if (path) {
    message += `API Path: ${path}\n\n`;
  }

  if (error.stack) {
    const stackLines = error.stack.split("\n").slice(0, 8);
    message += `Stack Trace:\n\`\`\`\n${stackLines.join("\n")}\n\`\`\`\n`;
  }

  if (messages && messages.length > 0) {
    const lastMessage = messages[messages.length - 1];
    const lastMessageText = lastMessage?.parts.filter(part => part.type === "text").join("");
    if (lastMessageText) {
      message += `\nLast Message:\n${lastMessageText}`;
    }
  }

  return escapeTelegramMarkdown(message);
}
