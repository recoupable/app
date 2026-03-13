import supabase from "./serverClient";

/**
 * Ensures the user has access to an artist
 *
 * @param artistId - The ID of the artist to ensure access to
 * @param accountId - The ID of the user to grant access to
 * @returns True if access was newly granted, false if the user already had access
 */
export async function ensureArtistAccess(artistId: string, accountId: string): Promise<boolean> {
  try {
    // Run both checks in parallel - they're independent
    const [artistResult, accessResult] = await Promise.all([
      // Verify the artist exists
      supabase.from("accounts").select("id").eq("id", artistId).single(),
      // Check if user already has access
      supabase
        .from("account_artist_ids")
        .select("artist_id")
        .eq("account_id", accountId)
        .eq("artist_id", artistId)
        .maybeSingle(),
    ]);

    if (artistResult.error || !artistResult.data) return false;

    // User already has access
    if (accessResult.data) return false;

    // Grant access
    const { error: insertError } = await supabase.from("account_artist_ids").insert({
      account_id: accountId,
      artist_id: artistId,
    });

    return !insertError;
  } catch (error) {
    console.error("Error ensuring artist access:", error);
    return false;
  }
}
