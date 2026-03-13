import { getSegmentIdForRoomId } from "@/lib/supabase/getSegmentIdForRoomId";

/**
 *
 * @param req
 */
export async function GET(req: Request) {
  try {
    const roomId = new URL(req.url).searchParams.get("roomId");
    if (!roomId) {
      return new Response(
        JSON.stringify({
          error: "Room ID is required",
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
    }

    const segmentId = await getSegmentIdForRoomId(roomId);
    return Response.json({ segmentId });
  } catch (error) {
    console.error("[/api/roomSegment] Error:", {
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });

    return new Response(
      JSON.stringify({
        error: "Failed to get segment ID",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  }
}

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";
