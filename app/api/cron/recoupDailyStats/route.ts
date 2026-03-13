import { NextResponse } from "next/server";
import { handleDailyStats } from "@/lib/handleDailyStats";

/**
 *
 */
export async function GET() {
  try {
    const stats = await handleDailyStats();
    return NextResponse.json(stats, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    );
  }
}

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;
