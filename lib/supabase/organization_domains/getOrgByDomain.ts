import supabase from "@/lib/supabase/serverClient";

/**
 * Look up an organization by email domain
 * Used to assign accounts to orgs on login
 *
 * @param domain - Email domain (e.g., "rostrum.com")
 * @returns Organization ID if found, null otherwise
 */
export async function getOrgByDomain(domain: string): Promise<string | null> {
  if (!domain) return null;

  try {
    const { data, error } = await supabase
      .from("organization_domains")
      .select("organization_id")
      .eq("domain", domain.toLowerCase())
      .single();

    if (error) {
      // PGRST116 = no match found, which is expected for non-org domains
      return null;
    }

    return data?.organization_id || null;
  } catch {
    return null;
  }
}

export default getOrgByDomain;
