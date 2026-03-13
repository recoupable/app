import { UIMessage } from "ai";
import { extractSendEmailResults } from "./extractSendEmailResults";
import { insertMemoryEmail } from "@/lib/supabase/memory_emails/insertMemoryEmail";

/**
 *
 * @param responseMessages
 */
export async function handleSendEmailToolOutputs(responseMessages: UIMessage[]): Promise<void> {
  const emailResults = extractSendEmailResults(responseMessages);
  if (emailResults.length === 0) return;

  await Promise.all(
    emailResults.map(({ emailId, messageId }) =>
      insertMemoryEmail({
        email_id: emailId,
        memory: messageId,
        message_id: messageId,
      }),
    ),
  );
}
