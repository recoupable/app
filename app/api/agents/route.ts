import { NextRequest, NextResponse } from "next/server";
import { getArtistAgents } from "@/lib/supabase/getArtistAgents";

/**
 *
 * @param request
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const socialIds = searchParams.getAll("socialId");

  if (!socialIds.length) {
    return NextResponse.json({ error: "At least one Social ID is required" }, { status: 400 });
  }

  try {
    const agents = await getArtistAgents(socialIds);
    return NextResponse.json(agents);
  } catch (error) {
    console.error("Error fetching segments:", error);
    return NextResponse.json({ error: "Failed to fetch segments" }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;
