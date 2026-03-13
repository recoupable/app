import { NextRequest, NextResponse } from "next/server";
import supabase from "@/lib/supabase/serverClient";

/**
 *
 * @param req
 */
export async function DELETE(req: NextRequest) {
  const { id } = await req.json();

  if (!id) {
    return NextResponse.json({ error: "Missing task id" }, { status: 400 });
  }

  try {
    const { error } = await supabase.from("scheduled_actions").delete().eq("id", id);

    if (error) {
      throw new Error(`Failed to delete task: ${error.message}`);
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete task from database" }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";
