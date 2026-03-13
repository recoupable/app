import getAccountDetailsByEmails from "@/lib/supabase/account_emails/getAccountDetailsByEmails";
import { insertAgentTemplateShares } from "./insertAgentTemplateShares";

/**
 * Create agent template shares for multiple email addresses
 *
 * @param templateId - The template ID to share
 * @param emails - Array of email addresses to share with
 */
export async function createAgentTemplateShares(
  templateId: string,
  emails: string[],
): Promise<void> {
  if (!emails || emails.length === 0) {
    return;
  }

  // Get user accounts by email using utility function
  const userEmails = await getAccountDetailsByEmails(emails);

  if (userEmails.length === 0) {
    return;
  }

  // Create share records for found users (filter out null account_ids)
  const sharesData = userEmails
    .filter(userEmail => userEmail.account_id !== null)
    .map(userEmail => ({
      template_id: templateId,
      user_id: userEmail.account_id!,
    }));

  // Insert shares using utility function
  await insertAgentTemplateShares(sharesData);
}
