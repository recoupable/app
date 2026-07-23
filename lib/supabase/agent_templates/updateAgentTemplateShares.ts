import { deleteAgentTemplateEmailSharesByTemplateId } from "./deleteAgentTemplateEmailShares";
import { deleteAgentTemplateSharesByTemplateId } from "./deleteAgentTemplateShares";
import { insertAgentTemplateEmailShares } from "./insertAgentTemplateEmailShares";
import { insertAgentTemplateShares } from "./insertAgentTemplateShares";
import { splitShareEmailsByAccount } from "./splitShareEmailsByAccount";

/**
 * Update agent template shares - replaces existing shares with new ones
 * @param templateId - The template ID to update shares for
 * @param emails - Array of email addresses to share with (replaces existing)
 */
export async function updateAgentTemplateShares(
  templateId: string,
  emails: string[]
): Promise<void> {
  // Replace both account-based shares and raw invited email shares.
  await Promise.all([
    deleteAgentTemplateSharesByTemplateId(templateId),
    deleteAgentTemplateEmailSharesByTemplateId(templateId),
  ]);

  if (!emails || emails.length === 0) {
    return;
  }

  const { accountIds, invitedEmails } = await splitShareEmailsByAccount(emails);

  if (accountIds.length > 0) {
    await insertAgentTemplateShares(
      accountIds.map((accountId) => ({
        template_id: templateId,
        user_id: accountId,
      }))
    );
  }

  if (invitedEmails.length > 0) {
    await insertAgentTemplateEmailShares(
      invitedEmails.map((email) => ({
        template_id: templateId,
        email,
      }))
    );
  }
}
