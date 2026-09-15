import { NextResponse } from "next/server";
import { z } from "zod";
import { NEW_API_BASE_URL } from "@/lib/consts";
import { getProfilePreferenceAccount } from "./getProfilePreferenceAccount";
import { selectArtistProfilePreferences } from "@/lib/supabase/account_artist_profile_preferences/selectArtistProfilePreferences";
import { setArtistProfilePreference } from "@/lib/supabase/account_artist_profile_preferences/setArtistProfilePreference";

const bodySchema = z
  .object({ artistId: z.string().uuid(), noProfile: z.boolean() })
  .strict();

/** Read/update the authenticated account's profile acknowledgements. */
export async function handleArtistProfilePreferences(
  request: Request,
): Promise<NextResponse> {
  try {
    const accountId = await getProfilePreferenceAccount(request);
    if (accountId instanceof NextResponse) return accountId;
    if (request.method === "PATCH") {
      const body = bodySchema.safeParse(await request.json().catch(() => null));
      if (!body.success)
        return NextResponse.json(
          { error: "Provide an artist and profile choice" },
          { status: 400 },
        );
      // This endpoint enforces direct or organization artist access for the token.
      const response = await fetch(
        `${NEW_API_BASE_URL}/api/artists/${body.data.artistId}/socials?limit=1`,
        {
          headers: { Authorization: request.headers.get("authorization")! },
          cache: "no-store",
        },
      );
      if (!response.ok)
        return NextResponse.json(
          { error: "Could not verify access to this artist" },
          {
            status: [401, 403, 404].includes(response.status)
              ? response.status
              : 503,
          },
        );
      const result = z
        .object({ status: z.literal("success") })
        .safeParse(await response.json());
      if (!result.success) throw new Error("Invalid artist access response");
      await setArtistProfilePreference(
        accountId,
        body.data.artistId,
        body.data.noProfile,
      );
    }
    const artistIds = await selectArtistProfilePreferences(accountId);
    return NextResponse.json(
      { accountId, artistIds },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch {
    return NextResponse.json(
      { error: "Could not save or load profile choices. Please try again." },
      { status: 503 },
    );
  }
}
