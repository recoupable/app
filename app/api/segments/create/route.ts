import { NextRequest, NextResponse } from "next/server";
import { createSegments } from "@/lib/segments/createSegments";

/**
 *
 * @param req
 */
export async function POST(req: NextRequest) {
  try {
    const { artist_account_id, prompt } = await req.json();
    if (!artist_account_id || !prompt) {
      return NextResponse.json(
        { error: "artist_account_id and prompt are required" },
        { status: 400 },
      );
    }
    const result = await createSegments({ artist_account_id, prompt });
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to create segments",
      },
      { status: 500 },
    );
  }
}
