import generateText from "@/lib/ai/generateText";
import sendEmail from "@/lib/email/sendEmail";
import { RECOUP_FROM_EMAIL } from "../consts";

/**
 * Sends a Recoup Apify webhook email to a list of emails, summarizing the dataset and using a strong CTA.
 *
 * @param dataset - Array of dataset objects (from Apify)
 * @param d
 * @param emails - Array of email addresses to send to
 * @returns The result of sendEmail
 */
export default async function sendApifyWebhookEmail(d: Record<string, unknown>, emails: string[]) {
  if (!emails?.length) return null;
  const prompt = `You have a new Apify dataset update. Here is the data:

Key Data
Full Name: ${d.fullName}
Username: ${d.username}
Profile URL: ${d.url}
Profile Picture: ${d.profilePicUrl}
Biography: ${d.biography}
External URL: ${d.externalUrls}
Followers: ${d.followersCount}
Following: ${d.followsCount}
Latest Posts: ${((d.latestPosts as unknown[]) || []).map(p => JSON.stringify(p)).join(", ")}
`;

  const { text } = await generateText({
    system: `you are a record label services manager for Recoup.
      write beautiful html email.
      subject: New Apify Dataset Notification. you're notifying music managers about new posts being available for one of their roster musician's Instagram profile.
      include a link to view the instagram profile.
      call to action is to open a chat link to learn more about the latest posts using Recoup Chat (AI Agents): https://chat.recoupable.com/?q=tell%20me%20about%20my%20latest%20Ig%20posts
      You'll be passed a dataset summary for a musician profile and their latest posts on instagram.
      your goal is to get the recipient to click a cta link to open a chat link to learn more about the latest posts using Recoup Chat (AI Agents).
      only include the email body html. 
      no headers or subject`,
    prompt,
  });

  return await sendEmail({
    from: RECOUP_FROM_EMAIL,
    to: emails,
    subject: `${d.fullName} has new posts on Instagram`,
    html: text,
  });
}
