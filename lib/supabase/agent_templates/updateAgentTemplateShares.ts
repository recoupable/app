import getAccountDetailsByEmails from "@/lib/supabase/account_emails/getAccountDetailsByEmails";
import { deleteAgentTemplateSharesByTemplateId } from "./deleteAgentTemplateShares";
import { insertAgentTemplateShares } from "./insertAgentTemplateShares";

/**
 * Update agent template shares - replaces existing shares with new ones
 *
 * @param templateId - The template ID to update shares for
 * @param emails - Array of email addresses to share with (replaces existing)
 */
export async function updateAgentTemplateShares(
  templateId: string,
  emails: string[],
): Promise<void> {
  // First, delete existing shares
  await deleteAgentTemplateSharesByTemplateId(templateId);

  // Then create new shares if emails provided
  if (emails && emails.length > 0) {
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
}
