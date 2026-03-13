import { getToolOrDynamicToolName, isToolOrDynamicToolUIPart, UIMessage } from "ai";

interface SendEmailResult {
  emailId: string;
  messageId: string;
}

/**
 * Extracts send_email tool results from response messages.
 * Returns an array of email IDs paired with the message ID containing the tool call.
 *
 * @param responseMessages - The assistant messages from the chat response
 * @returns Array of send email results with emailId and messageId
 */
export function extractSendEmailResults(responseMessages: UIMessage[]): SendEmailResult[] {
  const results: SendEmailResult[] = [];

  for (const message of responseMessages) {
    for (const part of message.parts) {
      const isDynamicTool = isToolOrDynamicToolUIPart(part);
      if (!isDynamicTool) continue;
      const isSendEmailTool = getToolOrDynamicToolName(part) === "send_email";
      if (!isSendEmailTool) continue;
      const hasEmailOutput = part.state === "output-available";
      if (!hasEmailOutput) continue;

      const output = part.output as {
        content?: Array<{ type?: string; text?: string }>;
        isError?: boolean;
      };

      if (!output.content?.[0]?.text) continue;

      const parsed = JSON.parse(output.content[0].text) as {
        success?: boolean;
        data?: { id?: string };
      };
      if (!parsed.data?.id) continue;
      results.push({
        emailId: parsed.data.id,
        messageId: message.id,
      });
    }
  }

  return results;
}
