import { insertAgentTemplateEmailShares } from "./insertAgentTemplateEmailShares";
import { insertAgentTemplateShares } from "./insertAgentTemplateShares";
import { splitShareEmailsByAccount } from "./splitShareEmailsByAccount";

/**
 * Create agent template shares for multiple email addresses
 * @param templateId - The template ID to share
 * @param emails - Array of email addresses to share with
 */
export async function createAgentTemplateShares(
  templateId: string,
  emails: string[]
): Promise<void> {
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
