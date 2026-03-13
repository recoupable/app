import supabase from "@/lib/supabase/serverClient";
import { NextRequest } from "next/server";

/**
 *
 * @param req
 */
export async function GET(req: NextRequest) {
  const artistId = req.nextUrl.searchParams.get("artistId");

  try {
    const { data: account_socials } = await supabase
      .from("account_socials")
      .select("*, social:socials(*)")
      .eq("account_id", artistId);
    if (!account_socials) throw new Error("failed");

    const account_social_ids = account_socials.map(account_social => account_social.social.id);

    const { data: fan_segments } = await supabase
      .from("artist_fan_segment")
      .select("*, socials!artist_fan_segment_fan_social_id_fkey(*)")
      .in("artist_social_id", account_social_ids);
    return Response.json(
      {
        fan_segments,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error(error);
    const message = error instanceof Error ? error.message : "failed";
    return Response.json({ message }, { status: 400 });
  }
}

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;
