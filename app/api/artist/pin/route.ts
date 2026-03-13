import { NextRequest } from "next/server";
import { toggleArtistPin } from "@/lib/supabase/account_artist_ids/toggleArtistPin";

export const runtime = "edge";

/**
 *
 * @param req
 */
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { accountId, artistId, pinned } = body;

  if (!accountId || !artistId || typeof pinned !== "boolean") {
    return Response.json(
      { message: "Missing required fields: accountId, artistId, pinned" },
      { status: 400 },
    );
  }

  try {
    const result = await toggleArtistPin({
      accountId,
      artistId,
      pinned,
    });

    return Response.json(result, { status: 200 });
  } catch (error) {
    console.error("Unexpected error:", error);
    const message = error instanceof Error ? error.message : "failed";
    return Response.json({ message }, { status: 400 });
  }
}

export const dynamic = "force-dynamic";
