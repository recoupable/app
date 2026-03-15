import getAccountEmails from "@/lib/supabase/account_emails/getAccountEmails";
import { getAgentTemplateSharesByTemplateIds } from "./getAgentTemplateSharesByTemplateIds";

/**
 *
 * @param templateIds
 */
export async function getSharedEmailsForTemplates(
  templateIds: string[],
): Promise<Record<string, string[]>> {
  if (!templateIds || templateIds.length === 0) return {};

  // Get all shares for these templates using existing utility
  const shares = await getAgentTemplateSharesByTemplateIds(templateIds);

  if (shares.length === 0) return {};

  // Get all user IDs who have access to these templates
  const userIds = [...new Set(shares.map(share => share.user_id))];

  // Get emails for these users using existing utility
  const emails = await getAccountEmails(userIds);

  // Create a map of user_id to email
  const userEmailMap: Record<string, string[]> = {};
  emails.forEach(emailRecord => {
    if (emailRecord.account_id && emailRecord.email) {
      if (!userEmailMap[emailRecord.account_id]) {
        userEmailMap[emailRecord.account_id] = [];
      }
      userEmailMap[emailRecord.account_id].push(emailRecord.email);
    }
  });

  // Create the final map of template_id to emails
  const emailMap: Record<string, string[]> = {};

  shares.forEach(share => {
    if (!emailMap[share.template_id]) {
      emailMap[share.template_id] = [];
    }

    // Add all emails for this user
    const userEmails = userEmailMap[share.user_id] || [];
    emailMap[share.template_id].push(...userEmails);
  });

  // Remove duplicates for each template
  Object.keys(emailMap).forEach(templateId => {
    emailMap[templateId] = [...new Set(emailMap[templateId])];
  });

  return emailMap;
}
