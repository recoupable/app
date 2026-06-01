import generateText from "@/lib/ai/generateText";
import sendEmail from "@/lib/email/sendEmail";
import { getChatUrl } from "@/lib/chat/chatPaths";
import { RECOUP_FROM_EMAIL } from "../consts";
import { getFetchableUrl } from "../arweave/gateway";

/**
 * Sends a Recoup Apify webhook email to a list of emails, summarizing the dataset and using a strong CTA.
 * @param dataset - Array of dataset objects (from Apify)
 * @param emails - Array of email addresses to send to
 * @returns The result of sendEmail
 */
export default async function generateTxtFileEmail({
  rawTextFile,
  arweaveFile,
  emails,
  sessionId,
  conversationId,
}: {
  rawTextFile: string;
  arweaveFile: string;
  emails: string[];
  sessionId: string;
  conversationId: string;
}) {
  if (!emails?.length) return null;
  const ctaUrl = getChatUrl(sessionId, conversationId);
  const prompt = `You have a newly generated TXT file. Here is the data:

Key Data
Raw Text File: ${rawTextFile}
Link to view the full TXT File: ${getFetchableUrl(arweaveFile)}
CTA URL: ${ctaUrl}
`;

  const { text } = await generateText({
    system: `you are a record label services manager for Recoup.
      write beautiful html email.
      subject: New TXT File Notification. you're notifying music managers about a new txt file they've generated using Recoup Chat (AI Agents).
      include a button to view the txt file (onClick open the CTA URL).
      do not mention arweave in your email.
      call to action is to open the original conversation where the txt file was generated using Recoup Chat (AI Agents): ${ctaUrl}
      You'll be passed a raw text file and a link to view the full TXT File.
      your goal is to get the recipient to click a cta link to open the original conversation where the txt file was generated using Recoup Chat (AI Agents).
      only include the email body html. 
      no headers or subject`,
    prompt,
  });

  return await sendEmail({
    from: RECOUP_FROM_EMAIL,
    to: emails,
    subject: `Recoup - New TXT File Created`,
    html: text,
  });
}
