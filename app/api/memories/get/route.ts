import { NextRequest } from "next/server";
import queryMemories from "@/lib/supabase/queryMemories";

/**
 *
 * @param req
 */
export async function GET(req: NextRequest) {
  const roomId = req.nextUrl.searchParams.get("roomId");

  if (!roomId) {
    return Response.json({ error: "Room ID is required" }, { status: 400 });
  }

  try {
    const { data, error } = await queryMemories(roomId, { ascending: true });

    if (error) {
      throw error;
    }

    return Response.json({ data }, { status: 200 });
  } catch (error) {
    console.error("[api/memories/get] Error:", error);
    const message = error instanceof Error ? error.message : "failed";
    return Response.json({ message }, { status: 400 });
  }
}

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";
