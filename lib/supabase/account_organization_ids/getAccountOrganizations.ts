import supabase from "@/lib/supabase/serverClient";
import type { Tables } from "@/types/database.types";

/** Row type with joined organization account and its info */
export type AccountOrganization = Tables<"account_organization_ids"> & {
  organization:
    | (Tables<"accounts"> & {
        account_info: Tables<"account_info">[] | null;
      })
    | null;
};

/**
 * Get all organizations an account belongs to
 *
 * @param accountId
 */
export async function getAccountOrganizations(accountId: string): Promise<AccountOrganization[]> {
  if (!accountId) return [];

  const { data, error } = await supabase
    .from("account_organization_ids")
    .select(
      `
      *,
      organization:accounts!account_organization_ids_organization_id_fkey (
        *,
        account_info ( * )
      )
    `,
    )
    .eq("account_id", accountId);

  if (error) return [];

  return (data as AccountOrganization[]) || [];
}

export default getAccountOrganizations;
