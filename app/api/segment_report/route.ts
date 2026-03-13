import supabase from "@/lib/supabase/serverClient";
import { NextRequest } from "next/server";

/**
 *
 * @param req
 */
export async function GET(req: NextRequest) {
  const reportId = req.nextUrl.searchParams.get("reportId");

  try {
    const { data, error } = await supabase
      .from("segment_reports")
      .select("*, artist:accounts(*, account_info(*))")
      .eq("id", reportId)
      .single();
    return Response.json({ data, error }, { status: 200 });
  } catch (error) {
    console.error(error);
    return Response.json({ data: null, error }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;
