import { NextResponse } from "next/server";

/**
 *
 */
export async function GET() {
  try {
    const response = await fetch("http://143.198.164.177:3000/api/agentkit/run", {
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;
