import supabase from "@/lib/supabase/serverClient";
import { STEP_OF_AGENT } from "@/types/Funnel";
import { NextRequest } from "next/server";

/**
 *
 * @param req
 */
export async function GET(req: NextRequest) {
  const artistId = req.nextUrl.searchParams.get("artistId");
  try {
    const { data: account } = await supabase
      .from("accounts")
      .select("*, account_socials(*)")
      .eq("id", artistId)
      .single();

    if (!account) return Response.json({ agent: null }, { status: 200 });

    const social_ids = account.account_socials.map(
      // eslint-disable-next-line
      (account_social: any) => account_social.social_id,
    );

    const { data: agent_status } = await supabase
      .from("agent_status")
      .select("*, social:socials(*), agent:agents(*)")
      .in("social_id", social_ids)
      .neq("status", STEP_OF_AGENT.FINISHED)
      .neq("status", STEP_OF_AGENT.ERROR)
      .neq("status", STEP_OF_AGENT.UNKNOWN_PROFILE)
      .neq("status", STEP_OF_AGENT.RATE_LIMIT_EXCEEDED)
      .neq("status", STEP_OF_AGENT.MISSING_POSTS)
      .order("updated_at", { ascending: false })
      .limit(1)
      .single();

    return Response.json({ agent: agent_status }, { status: 200 });
  } catch (error) {
    console.error(error);
    const message = error instanceof Error ? error.message : "failed";
    return Response.json({ message }, { status: 400 });
  }
}

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;
