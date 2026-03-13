import supabase from "@/lib/supabase/serverClient";

/**
 * Check if an account has access to a specific artist
 *
 * Access is granted if:
 * 1. Account has direct access via account_artist_ids, OR
 * 2. Account and artist share an organization
 *
 * Fails closed: returns false on any database error to deny access safely.
 *
 * @param accountId - The account ID to check
 * @param artistId - The artist ID to check access for
 * @returns true if the account has access to the artist, false otherwise
 */
export async function checkAccountArtistAccess(
  accountId: string,
  artistId: string,
): Promise<boolean> {
  try {
    // 1. Check direct access via account_artist_ids
    const { data: directAccess, error: directError } = await supabase
      .from("account_artist_ids")
      .select("artist_id")
      .eq("account_id", accountId)
      .eq("artist_id", artistId)
      .maybeSingle();

    if (directError) {
      console.error("[checkAccountArtistAccess] Direct access query failed:", {
        accountId,
        artistId,
        error: directError.message,
      });
      return false; // Fail closed
    }

    if (directAccess) return true;

    // 2. Check organization access: user and artist share an org
    // Get all orgs the artist belongs to
    const { data: artistOrgs, error: artistOrgsError } = await supabase
      .from("artist_organization_ids")
      .select("organization_id")
      .eq("artist_id", artistId);

    if (artistOrgsError) {
      console.error("[checkAccountArtistAccess] Artist orgs query failed:", {
        artistId,
        error: artistOrgsError.message,
      });
      return false; // Fail closed
    }

    if (!artistOrgs?.length) return false;

    // Check if user belongs to any of those orgs
    const orgIds = artistOrgs.map(o => o.organization_id).filter(Boolean);
    if (!orgIds.length) return false;

    const { data: userOrgAccess, error: userOrgError } = await supabase
      .from("account_organization_ids")
      .select("organization_id")
      .eq("account_id", accountId)
      .in("organization_id", orgIds)
      .limit(1);

    if (userOrgError) {
      console.error("[checkAccountArtistAccess] User org access query failed:", {
        accountId,
        orgIds,
        error: userOrgError.message,
      });
      return false; // Fail closed
    }

    return !!userOrgAccess?.length;
  } catch (error) {
    // Catch any unexpected errors (network issues, etc.)
    console.error("[checkAccountArtistAccess] Unexpected error:", {
      accountId,
      artistId,
      error: error instanceof Error ? error.message : "Unknown error",
    });
    return false; // Fail closed
  }
}
