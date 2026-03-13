import supabase from "@/lib/supabase/serverClient";

interface ToggleArtistPinParams {
  accountId: string;
  artistId: string;
  pinned: boolean;
}

/**
 * Toggle the pinned status of an artist for a user.
 * Uses upsert to create the row if it doesn't exist (for org artists).
 *
 * @param root0
 * @param root0.accountId
 * @param root0.artistId
 * @param root0.pinned
 */
export const toggleArtistPin = async ({ accountId, artistId, pinned }: ToggleArtistPinParams) => {
  const { error } = await supabase
    .from("account_artist_ids")
    .upsert(
      { account_id: accountId, artist_id: artistId, pinned },
      { onConflict: "account_id,artist_id" },
    );

  if (error) {
    throw new Error("Failed to update pinned status");
  }

  return { success: true, pinned };
};

export default toggleArtistPin;
