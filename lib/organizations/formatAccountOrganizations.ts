import type { AccountOrganization } from "@/lib/supabase/account_organization_ids/getAccountOrganizations";

export interface FormattedOrganization {
  id: string;
  organization_id: string | null;
  organization_name: string | null;
  organization_image: string | null;
}

/**
 * Formats raw account organizations into a flat structure for the frontend.
 * Deduplicates by organization_id.
 *
 * @param rawOrgs
 */
export function formatAccountOrganizations(
  rawOrgs: AccountOrganization[],
): FormattedOrganization[] {
  const seen = new Set<string>();

  return rawOrgs
    .filter(org => {
      if (!org.organization_id || seen.has(org.organization_id)) return false;
      seen.add(org.organization_id);
      return true;
    })
    .map(org => ({
      id: org.id,
      organization_id: org.organization_id,
      organization_name: org.organization?.name || null,
      organization_image: org.organization?.account_info?.[0]?.image || null,
    }));
}
