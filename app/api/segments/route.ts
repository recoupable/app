import { getArtistSegments } from "@/lib/supabase/getArtistSegments";
import { NextRequest } from "next/server";

/**
 *
 * @param req
 */
export async function GET(req: NextRequest) {
  const artistId = req.nextUrl.searchParams.get("artistId");

  if (!artistId) {
    return Response.json({ error: "artistId is required" }, { status: 400 });
  }

  try {
    const segments = await getArtistSegments(artistId);
    return Response.json(segments, { status: 200 });
  } catch (error) {
    console.error("Error fetching segments:", error);
    return Response.json({ error: "Failed to fetch segments" }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;
