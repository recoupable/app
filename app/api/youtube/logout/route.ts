import { NextRequest, NextResponse } from "next/server";
import deleteYouTubeTokens from "@/lib/supabase/youtube_tokens/deleteYouTubeTokens";

/**
 *
 * @param request
 */
export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const artistAccountId = searchParams.get("artist_account_id");

  if (!artistAccountId) {
    return NextResponse.json({ error: "Artist account ID is required" }, { status: 400 });
  }

  try {
    const success = await deleteYouTubeTokens(artistAccountId);

    if (success) {
      return NextResponse.json({
        message: "YouTube access removed successfully",
        status: "disconnected",
      });
    } else {
      return NextResponse.json({ error: "Failed to remove YouTube access" }, { status: 500 });
    }
  } catch (error) {
    console.error("Error in YouTube logout:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
