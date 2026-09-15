import supabase from "@/lib/supabase/serverClient";

/** Idempotent, account-scoped acknowledgement. Removing it restores setup. */
export async function setArtistProfilePreference(
  accountId: string,
  artistId: string,
  noProfile: boolean,
): Promise<void> {
  const table = supabase.from("account_artist_profile_preferences");
  const result = noProfile
    ? await table.upsert(
        { account_id: accountId, artist_id: artistId },
        { onConflict: "account_id,artist_id", ignoreDuplicates: true },
      )
    : await table
        .delete()
        .eq("account_id", accountId)
        .eq("artist_id", artistId);
  if (result.error) throw new Error("Could not save profile choice");
}
