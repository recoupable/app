import getAccountDetailsByEmails from "@/lib/supabase/account_emails/getAccountDetailsByEmails";

export interface SplitShareEmailsByAccountResult {
  accountIds: string[];
  invitedEmails: string[];
}

export async function splitShareEmailsByAccount(
  emails: string[]
): Promise<SplitShareEmailsByAccountResult> {
  const normalizedEmails = [...new Set(
    emails
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean)
  )];

  if (normalizedEmails.length === 0) {
    return {
      accountIds: [],
      invitedEmails: [],
    };
  }

  const userEmails = await getAccountDetailsByEmails(normalizedEmails);
  const resolvedEmails = new Set(
    userEmails
      .map((row) => row.email)
      .filter((email): email is string => typeof email === "string" && email.length > 0)
      .map((email) => email.toLowerCase())
  );

  const accountIds = [...new Set(
    userEmails
      .map((row) => row.account_id)
      .filter((accountId): accountId is string => typeof accountId === "string" && accountId.length > 0)
  )];

  const invitedEmails = normalizedEmails.filter((email) => !resolvedEmails.has(email));

  return {
    accountIds,
    invitedEmails,
  };
}
