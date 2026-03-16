import supabase from "@/lib/supabase/serverClient";

/**
 * Get full artist data including account_socials and account_info
 *
 * @param id - ID of the artist account
 * @returns Artist data or null if not found
 */
export async function getArtistById(id: string) {
  try {
    const { data, error } = await supabase
      .from("accounts")
      .select("*, account_socials(*), account_info(*)")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching artist data:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Unexpected error fetching artist data:", error);
    return null;
  }
}

export default getArtistById;
