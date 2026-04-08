import type { PrivyClient } from "@privy-io/react-auth";
import getArtist from "@/lib/getArtist";

type GetAccessToken = PrivyClient["getAccessToken"];

export async function fetchAuthenticatedArtist(
  artistId: string,
  getAccessToken: GetAccessToken,
) {
  const accessToken = await getAccessToken();
  if (!accessToken) {
    throw new Error("Please sign in to view artist details");
  }

  return getArtist(artistId, accessToken);
}
