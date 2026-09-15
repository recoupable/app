import { handleArtistProfilePreferences } from "@/lib/onboarding/server/handleArtistProfilePreferences";

export const dynamic = "force-dynamic";
/** Load account-scoped profile choices after authenticating with the Recoup API. */
export async function GET(request: Request) {
  return handleArtistProfilePreferences(request);
}
/** Save or undo an artist's No profile yet choice. */
export async function PATCH(request: Request) {
  return handleArtistProfilePreferences(request);
}
