import supabase from "@/lib/supabase/serverClient";

/** Only called with the account ID resolved from a verified access token. */
export async function selectArtistProfilePreferences(
  accountId: string,
): Promise<string[]> {
  const { data, error } = await supabase
    .from("account_artist_profile_preferences")
    .select("artist_id")
    .eq("account_id", accountId);
  if (error) throw new Error("Could not load profile choices");
  return (data ?? []).map((row: { artist_id: string }) => row.artist_id);
}
