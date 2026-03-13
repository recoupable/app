import supabase from "@/lib/supabase/serverClient";

/**
 * Add an artist to an organization
 * Used when creating new artists to link them to an org
 *
 * @param artistId - The artist's account ID
 * @param organizationId - The organization ID to add them to
 * @returns The created record ID, or null if failed/already exists
 */
export async function addArtistToOrganization(
  artistId: string,
  organizationId: string,
): Promise<string | null> {
  if (!artistId || !organizationId) return null;

  try {
    // Atomic upsert: insert or return existing row
    // Requires unique constraint on (artist_id, organization_id)
    const { data, error } = await supabase
      .from("artist_organization_ids")
      .upsert(
        { artist_id: artistId, organization_id: organizationId },
        { onConflict: "artist_id,organization_id", ignoreDuplicates: false },
      )
      .select("id")
      .single();

    if (error) {
      return null;
    }

    return data?.id || null;
  } catch {
    return null;
  }
}

export default addArtistToOrganization;
