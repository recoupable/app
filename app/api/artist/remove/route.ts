import supabase from "@/lib/supabase/serverClient";
import { NextRequest } from "next/server";

/**
 *
 * @param req
 */
export async function GET(req: NextRequest) {
  const artistId = req.nextUrl.searchParams.get("artistId");

  try {
    await supabase.from("accounts").delete().eq("id", artistId);
    return Response.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error(error);
    const message = error instanceof Error ? error.message : "failed";
    return Response.json({ message }, { status: 400 });
  }
}

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;
