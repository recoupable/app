import { NextResponse } from "next/server";
import { listFilesByArtist } from "@/lib/supabase/files/listFilesByArtist";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const ownerAccountId = searchParams.get("ownerAccountId");
    const artistAccountId = searchParams.get("artistAccountId");
    const path = searchParams.get("path") || undefined;
    const recursive = searchParams.get("recursive") === "true";

    if (!ownerAccountId || !artistAccountId) {
      return NextResponse.json({ error: "Missing ownerAccountId or artistAccountId" }, { status: 400 });
    }

    // Use shared helper function (properly filters team files and immediate children)
    const files = await listFilesByArtist(ownerAccountId, artistAccountId, path, recursive);

    return NextResponse.json({ files }, { status: 200 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
