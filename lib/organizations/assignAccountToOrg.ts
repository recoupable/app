import extractDomain from "@/lib/email/extractDomain";
import getOrgByDomain from "@/lib/supabase/organization_domains/getOrgByDomain";
import addAccountToOrganization from "@/lib/supabase/account_organization_ids/addAccountToOrganization";

/**
 * Assign an account to their organization based on email domain.
 * Called on login to ensure accounts are linked to their org.
 *
 * @param accountId - The account ID
 * @param email - The account's email address
 * @returns The org ID if assigned, null otherwise
 */
export async function assignAccountToOrg(accountId: string, email: string): Promise<string | null> {
  if (!accountId || !email) return null;

  const domain = extractDomain(email);
  if (!domain) return null;

  const orgId = await getOrgByDomain(domain);
  if (!orgId) return null;

  await addAccountToOrganization(accountId, orgId);
  return orgId;
}

export default assignAccountToOrg;
