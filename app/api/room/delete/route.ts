import { NextRequest } from "next/server";
import supabase from "@/lib/supabase/serverClient";

/**
 *
 * @param req
 */
export async function POST(req: NextRequest) {
  try {
    const { roomId } = await req.json();

    if (!roomId) {
      return Response.json({ message: "Missing required parameter: roomId" }, { status: 400 });
    }

    // First delete any related data
    // Delete messages in this room
    const { error: messagesError } = await supabase.from("messages").delete().eq("room_id", roomId);

    if (messagesError) {
      console.error("Error deleting messages:", messagesError);
      // Continue with the deletion process even if this fails
    }

    // Delete room_reports associations
    const { error: reportError } = await supabase
      .from("room_reports")
      .delete()
      .eq("room_id", roomId);

    if (reportError) {
      console.error("Error deleting room reports:", reportError);
      // Continue with the deletion process even if this fails
    }

    // Finally delete the room itself
    const { error } = await supabase.from("rooms").delete().eq("id", roomId);

    if (error) {
      console.error("Error deleting room:", error);
      return Response.json(
        { message: "Failed to delete room", error: error.message },
        { status: 500 },
      );
    }

    return Response.json({ message: "Room deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error in /api/room/delete:", error);
    const message = error instanceof Error ? error.message : "Server error";
    return Response.json({ message }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;
